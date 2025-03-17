import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { and, eq } from "drizzle-orm";
import { TextDecoder } from "util";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a Youtube video based on its transcript. Please follow theses guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspects of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where aplicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any addition formatting. The languague is portuguese.`;

export const { POST } = serve(
  async (context) => {
    const input = context.requestPayload as InputType
    const { userId, videoId } = input

    const existingVideo = await context.run('get-video', async () => {
      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.id, videoId),
            eq(videos.userId, userId),
          )
        )

      if (!data[0]) {
        throw new Error("Video not found")
      }

      return data[0];
    })

    const transcript = await context.run('get-transcript', async () => {
      const trackUrl = `https://stream.mux.com/${existingVideo.muxPlaybackId}/text/${existingVideo.muxTrackId}.txt`;

      const response = await fetch(trackUrl);
      const text = await response.text();

      if (!text) {
        throw new Error("Transcript not found")
      }

      return text;
    })

    const {body} = await context.api.openai.call(
      "generate-title",
      {
        token: process.env.OPENAI_API_KEY!,
        operation: "chat.completions.create",
        body: {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: TITLE_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: transcript,
            }
          ],
        },
      }
    );

    
    await context.run("update-video", async () => {
      const title = body.choices?.[0]?.message.content;

      if (!title) {
        throw new Error("Title not found")
      }

      const decoder = new TextDecoder("utf-8");
      const fixedTitle = decoder.decode(Buffer.from(title, "latin1"));

      await db
        .update(videos)
        .set({
          title: fixedTitle || existingVideo.title,
        })
        .where(
          and(
            eq(videos.id, existingVideo.id),
            eq(videos.userId, userId),
          )
        )
    })
  },
)