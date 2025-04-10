'use client';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { DEFAULT_LIMIT } from '@/constants';
import { trpc } from '@/trpc/client';
import { ListIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'

export const LoadingSubscriptionsSection = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Inscrições</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            [1, 2, 3, 4, 5].map((i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton disabled>
                  <Skeleton className='size-6 rounded-full shrink-0' />
                  <Skeleton className='h-4 w-full' />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
};

export default function SubscriptionsSection() {
  const pathname = usePathname();
  const { data, isLoading } = trpc.subscriptions.getMany.useInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  if (isLoading) {
    return <LoadingSubscriptionsSection />
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Inscrições</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            data?.pages.flatMap((page) => page.items).map((subscription) => (
              <SidebarMenuItem key={`${subscription.creatorId}-${subscription.viewerId}`}>
                <SidebarMenuButton tooltip={subscription.user.name} asChild isActive={pathname === `/users/${subscription.user.id}`}>
                  <Link prefetch  href={`/users/${subscription.user.id}`} className='flex items-center gap-4'>
                    <UserAvatar
                      size='sm'
                      imageUrl={subscription.user.imageUrl}
                      name={subscription.user.name}
                    />
                    <span className='text-sm'>{subscription.user.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
            )
          }
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/subscriptions'}>
              <Link prefetch  href='/subscriptions' className='flex items-center gap-4'>
                <ListIcon className='size-4' />
                <span className='text-sm'>
                  Todas as Inscrições
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
