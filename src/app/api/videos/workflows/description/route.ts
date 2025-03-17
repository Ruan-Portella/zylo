import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { and, eq } from "drizzle-orm";
import { TextDecoder } from "util";

interface InputType {
  userId: string;
  videoId: string;
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 setences long and no more than 200 characters.
- The languague is portuguese.`;

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
      "generate-description",
      {
        token: process.env.OPENAI_API_KEY!,
        operation: "chat.completions.create",
        body: {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: DESCRIPTION_SYSTEM_PROMPT,
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
      const description = body.choices?.[0]?.message.content;

      if (!description) {
        throw new Error("Description not found")
      }

      const decoder = new TextDecoder("utf-8");
      const fixedDescription = decoder.decode(Buffer.from(description, "latin1"));

      await db
        .update(videos)
        .set({
          description: fixedDescription || existingVideo.description,
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