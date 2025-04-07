import { db } from "@/db";
import { playlists, playlistsVideos, users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

export const playlistRouter = createTRPCRouter({
  getHistory: protectedProcedure.input(
    z.object({
      cursor: z.object({
        id: z.string().uuid(),
        viewedAt: z.date(),
      }).nullish(),
      limit: z.number().min(1).max(100)
    })
  ).query(async ({ ctx, input }) => {
    const { cursor, limit } = input;
    const { id: userId } = ctx.user;

    const viewerVideoViews = db.$with('viewer_video_views').as(
      db.select({
        videoId: videoViews.videoId,
        viewedAt: videoViews.updateAt,
      })
        .from(videoViews)
        .where(eq(videoViews.userId, userId))
    )

    const data = await db
      .with(viewerVideoViews)
      .select({
        ...getTableColumns(videos),
        user: users,
        viewedAt: viewerVideoViews.viewedAt,
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        likeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "like")
        )),
        dislikeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "dislike")
        )),
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
      .where(and(
        eq(videos.visibility, "public"),
        cursor
          ? or(
            lt(viewerVideoViews.viewedAt, cursor.viewedAt),
            and(
              eq(viewerVideoViews.viewedAt, cursor.viewedAt),
              lt(videos.id, cursor.id)
            )
          )
          : undefined,
      )).orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id)).limit(limit + 1)

    const hasMore = data.length > limit;

    const items = hasMore ? data.slice(0, -1) : data;

    const lastItem = items[items.length - 1];
    const nextCursor = hasMore ?
      {
        id: lastItem.id,
        viewedAt: lastItem.viewedAt,
      } : null;

    return {
      items,
      nextCursor,
    };
  }),
  getLiked: protectedProcedure.input(
    z.object({
      cursor: z.object({
        id: z.string().uuid(),
        likedAt: z.date(),
      }).nullish(),
      limit: z.number().min(1).max(100)
    })
  ).query(async ({ ctx, input }) => {
    const { cursor, limit } = input;
    const { id: userId } = ctx.user;

    const viewerVideoReactions = db.$with('viewer_video_reactions').as(
      db.select({
        videoId: videoReactions.videoId,
        likedAt: videoReactions.updateAt,
      })
        .from(videoReactions)
        .where(and(
          eq(videoReactions.userId, userId),
          eq(videoReactions.type, "like")
        )
        )
    )

    const data = await db
      .with(viewerVideoReactions)
      .select({
        ...getTableColumns(videos),
        user: users,
        likedAt: viewerVideoReactions.likedAt,
        viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
        likeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "like")
        )),
        dislikeCount: db.$count(videoReactions, and(
          eq(videoReactions.videoId, videos.id),
          eq(videoReactions.type, "dislike")
        )),
      })
      .from(videos)
      .innerJoin(users, eq(videos.userId, users.id))
      .innerJoin(viewerVideoReactions, eq(videos.id, viewerVideoReactions.videoId))
      .where(and(
        eq(videos.visibility, "public"),
        cursor
          ? or(
            lt(viewerVideoReactions.likedAt, cursor.likedAt),
            and(
              eq(viewerVideoReactions.likedAt, cursor.likedAt),
              lt(videos.id, cursor.id)
            )
          )
          : undefined,
      )).orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id)).limit(limit + 1)

    const hasMore = data.length > limit;

    const items = hasMore ? data.slice(0, -1) : data;

    const lastItem = items[items.length - 1];
    const nextCursor = hasMore ?
      {
        id: lastItem.id,
        likedAt: lastItem.likedAt,
      } : null;

    return {
      items,
      nextCursor,
    };
  }),
  create: protectedProcedure.input(
    z.object({
      name: z.string().min(1),
    })
  ).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const { name } = input;

    const [createdPlaylist] = await db
      .insert(playlists)
      .values({
        userId,
        name,
      }).returning();

    if (!createdPlaylist) {
      return new TRPCError({ code: 'BAD_REQUEST' });
    }

    return createdPlaylist;
  }),
  getMany: protectedProcedure.input(
    z.object({
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      }).nullish(),
      limit: z.number().min(1).max(100)
    })
  ).query(async ({ ctx, input }) => {
    const { cursor, limit } = input;
    const { id: userId } = ctx.user;

    const data = await db
      .select({
        ...getTableColumns(playlists),
        videoCount: db.$count(playlistsVideos, eq(playlistsVideos.playlistId, playlists.id)),
        user: users
      })
      .from(playlists)
      .innerJoin(users, eq(playlists.userId, users.id))
      .where(and(
        eq(playlists.userId, userId),
        cursor
          ? or(
            lt(playlists.updatedAt, cursor.updatedAt),
            and(
              eq(playlists.updatedAt, cursor.updatedAt),
              lt(playlists.id, cursor.id)
            )
          )
          : undefined,
      )).orderBy(desc(playlists.updatedAt), desc(playlists.id)).limit(limit + 1)

    const hasMore = data.length > limit;

    const items = hasMore ? data.slice(0, -1) : data;

    const lastItem = items[items.length - 1];
    const nextCursor = hasMore ?
      {
        id: lastItem.id,
        updatedAt: lastItem.updatedAt,
      } : null;

    return {
      items,
      nextCursor,
    };
  }),
})