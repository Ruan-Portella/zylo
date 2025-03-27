import { db } from "@/db";
import { users, videoReactions, videos, videoUpdateSchema, videoViews } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policy: ['public'],
        input: [
          {
            generated_subtitles: [
              {
                language_code: 'en',
                name: 'Inglês',
              },
              // {
              //   language_code: 'pt',
              //   name: 'Português',
              // }
            ]
          }
        ]
      },
      cors_origin: '*', // TODO: change this to the actual origin
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: 'New Video',
        muxStatus: 'waiting',
        muxUploadId: upload.id,
      }).returning();

    return {
      video,
      url: upload.url,
    }
  }),
  update: protectedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    if (!input.id) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }

    const [updatedVideo] = await db
      .update(videos)
      .set({
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        visibility: input.visibility,
        updatedAt: new Date(),
      })
      .where(and(
        eq(videos.id, input.id),
        eq(videos.userId, userId),
      ))
      .returning();

    if (!updatedVideo) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    return updatedVideo;
  }),
  remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const [video] = await db
      .delete(videos)
      .where(and(
        eq(videos.id, input.id),
        eq(videos.userId, userId),
      ))
      .returning();

    if (!video) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    return video;
  }),
  restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;


    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(
        eq(videos.id, input.id),
        eq(videos.userId, userId),
      ));

    if (!existingVideo) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    if (existingVideo.thumbnailKey) {
      const utapi = new UTApi();

      await utapi.deleteFiles([existingVideo.thumbnailKey]);
      await db.update(videos)
        .set({
          thumbnailUrl: null,
          thumbnailKey: null,
        })
        .where(and(
          eq(videos.id, input.id),
          eq(videos.userId, userId),
        ));
    }

    if (!existingVideo.muxPlaybackId) {
      throw new TRPCError({ code: 'BAD_REQUEST' })
    }

    const thumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

    const [video] = await db
      .update(videos)
      .set({ thumbnailUrl })
      .where(and(
        eq(videos.id, input.id),
        eq(videos.userId, userId),
      ))
      .returning();

    return video;
  }),
  generateThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid(), prompt: z.string().min(10) })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const { workflowRunId } = await workflow.trigger({
      url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
      body: {
        userId,
        videoId: input.id,
        prompt: input.prompt,
      }
    });

    return workflowRunId;
  }),
  generateTitle: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const { workflowRunId } = await workflow.trigger({
      url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
      body: {
        userId,
        videoId: input.id,
      }
    });

    return workflowRunId;
  }),
  generateDescription: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;

    const { workflowRunId } = await workflow.trigger({
      url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
      body: {
        userId,
        videoId: input.id,
      }
    });

    return workflowRunId;
  }),
  getOne: baseProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
    const { clerkUserId } = ctx;

    let userId;

    const [user] = await db
      .select()
      .from(users)
      .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))

    if (user) {
      userId = user.id;
    }

    const viewerReactions = db.$with("viewer_reactions").as(
      db.select({
        videoId: videoReactions.videoId,
        type: videoReactions.type,
      })
        .from(videoReactions)
        .where(
          inArray(videoReactions.userId, userId ? [userId] : []),
        )
    )

    const [existingVideo] = await db
      .with(viewerReactions)
      .select({
        ...getTableColumns(videos),
        user: {
          ...getTableColumns(users),
        },
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        likeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, 'like'),
        )),
        dislikeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, 'dislike'),
        )),
        viewerReaction: viewerReactions.type,
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .leftJoin(viewerReactions, eq(videos.id, viewerReactions.videoId))
      .where(
        eq(videos.id, input.id),
      )

    if (!existingVideo) {
      throw new TRPCError({ code: 'NOT_FOUND' })
    }

    return existingVideo;
  }),
})