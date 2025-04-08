import { db } from "@/db";
import { playlists, playlistsVideos, users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
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
        user: users,
        thumbnailUrl: sql<string | null>`(
          SELECT v.thumbnail_url FROM ${playlistsVideos} pv JOIN ${videos} v ON pv.video_id = v.id WHERE pv.playlist_id = ${playlists.id} ORDER BY pv.updated_at DESC LIMIT 1
        )`
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
  getManyForVideo: protectedProcedure.input(
    z.object({
      videoId: z.string().uuid(),
      cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date(),
      }).nullish(),
      limit: z.number().min(1).max(100)
    })
  ).query(async ({ ctx, input }) => {
    const { cursor, limit, videoId } = input;
    const { id: userId } = ctx.user;

    const data = await db
      .select({
        ...getTableColumns(playlists),
        videoCount: db.$count(playlistsVideos, eq(playlistsVideos.playlistId, playlists.id)),
        user: users,
        containsVideo: videoId ? sql<boolean>`(
          SELECT EXISTS (SELECT 1 FROM ${playlistsVideos} pv WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId})
        )` : sql<boolean>`false`
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
  addVideo: protectedProcedure.input(
    z.object({
      playlistId: z.string().uuid(),
      videoId: z.string().uuid(),
    })
  ).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const { playlistId, videoId } = input;

    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(and(
        eq(playlists.id, playlistId),
      ))

    if (!existingPlaylist) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    if (existingPlaylist.userId !== userId) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(
        eq(videos.id, videoId),
      ))

    if (!existingVideo) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const [existingPlaylistVideo] = await db
      .select()
      .from(playlistsVideos)
      .where(and(
        eq(playlistsVideos.playlistId, playlistId),
        eq(playlistsVideos.videoId, videoId),
      ))

    if (existingPlaylistVideo) {
      throw new TRPCError({ code: 'CONFLICT' });
    };

    const [createdPlaylistVideo] = await db
      .insert(playlistsVideos)
      .values({
        playlistId,
        videoId,
      }).returning();

    if (!createdPlaylistVideo) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    return createdPlaylistVideo;
  }),
  removeVideo: protectedProcedure.input(
    z.object({
      playlistId: z.string().uuid(),
      videoId: z.string().uuid(),
    })
  ).mutation(async ({ ctx, input }) => {
    const { id: userId } = ctx.user;
    const { playlistId, videoId } = input;

    const [existingPlaylist] = await db
      .select()
      .from(playlists)
      .where(and(
        eq(playlists.id, playlistId),
      ))

    if (!existingPlaylist) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    if (existingPlaylist.userId !== userId) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(
        eq(videos.id, videoId),
      ))

    if (!existingVideo) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    const [existingPlaylistVideo] = await db
      .select()
      .from(playlistsVideos)
      .where(and(
        eq(playlistsVideos.playlistId, playlistId),
        eq(playlistsVideos.videoId, videoId),
      ))

    if (!existingPlaylistVideo) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    };

    const [deletedPlaylistVideo] = await db
      .delete(playlistsVideos)
      .where(
        and(
          eq(playlistsVideos.playlistId, playlistId),
          eq(playlistsVideos.videoId, videoId),
        )
      ).returning();

    if (!deletedPlaylistVideo) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    return deletedPlaylistVideo;
  }),
})