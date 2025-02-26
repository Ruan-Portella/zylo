'use client';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const items = [
  {
    title: 'Histórico',
    url: '/playlists/history',
    icon: HistoryIcon,
    auth: true,
  },
  {
    title: 'Vídeos com "Gostei"',
    url: '/playlists/liked',
    icon: ThumbsUpIcon,
    auth: true,
  },
  {
    title: 'Todas Playlists',
    url: '/playlists',
    icon: ListVideoIcon,
    auth: true,
  }
];

export default function PersonalSection() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Você</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {
            items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild isActive={false} onClick={() => { }}>
                  <Link href={item.url} className='flex items-center gap-4'>
                    <item.icon />
                    <span className='text-sm'>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
            )
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
