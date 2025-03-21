import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs"
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import sharp from "sharp";
import fetch from "node-fetch";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

async function resizeImage(url: string) {
  const response = await fetch(url);
  const buffer = await response.buffer();

  const resizedBuffer = await sharp(buffer)
    .resize(1920, 1080, { fit: "cover" })
    .toBuffer();

  const createId = () => Math.random().toString(36).substring(7);

  // Converter Buffer para Blob
  const resizedBlob = new File([resizedBuffer], `${createId()}.png`);

  return resizedBlob;
}

export const { POST } = serve(
  async (context) => {
    const utapi = new UTApi();
    const input = context.requestPayload as InputType
    const { userId, videoId, prompt } = input

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

    const { body } = await context.call<{ data: Array<{ url: string }> }>('generate-thumbnail', {
      url: 'https://api.openai.com/v1/images/generations',
      method: 'POST',
      body: {
        prompt,
        n: 1,
        model: 'dall-e-2',
        size: '512x512',
      },
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      }
    })

    const tempThumbnailUrl = body?.data?.[0]?.url;

    if (!tempThumbnailUrl) {
      throw new Error("Bad response from OpenAI")
    }

    const resizedThumbnail = await resizeImage(tempThumbnailUrl);

    await context.run('cleanup-thumbnail', async () => {
      if (existingVideo.thumbnailKey) {
        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db.update(videos)
          .set({
            thumbnailKey: null,
            thumbnailUrl: null,
          })
          .where(
            and(
              eq(videos.id, existingVideo.id),
              eq(videos.userId, userId),
            )
          )
      }
    })

    const uploadedThumbnail = await context.run('upload-thumbnail', async () => {
      const { data } = await utapi.uploadFiles(resizedThumbnail)

      if (!data) {
        throw new Error("Failed to upload thumbnail")
      }

      return data;
    })

    await context.run("update-video", async () => {

      await db
        .update(videos)
        .set({
          thumbnailUrl: uploadedThumbnail.url || existingVideo.thumbnailUrl,
          thumbnailKey: uploadedThumbnail.key || existingVideo.thumbnailKey
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