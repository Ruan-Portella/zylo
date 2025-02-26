'use client';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { FlameIcon, HomeIcon, PlaySquareIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

const items = [
  {
    title: 'Inicio',
    url: '/',
    icon: HomeIcon,
  },
  {
    title: 'Inscrições',
    url: '/feed/subscriptions',
    icon: PlaySquareIcon,
    auth: true,
  },
  {
    title: 'Trending',
    url: '/feed/trending',
    icon: FlameIcon,
  }
];

export default function MainSection() {
  return (
    <SidebarGroup>
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
