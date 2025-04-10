"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOutIcon, VideoIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator';
import StudioSideBarHeader from './studio-sidebar-header';

export default function StudioSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className='pt-16 z-40' collapsible='icon'>
      <SidebarContent className='bg-background'>
        <div className="flex items-center flex-shrink-0 px-2.5 md:hidden">
          <SidebarTrigger className='pt-4' />
          <Link prefetch  href="/">
            <div className="p-3 pb-0 flex gap-1 cursor-pointer items-center">
              <Image src="/logo.svg" alt="logo" width={28} height={28} />
              <p className="text-xl font-semibold tracking-tighter">Zylo</p>
            </div>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <StudioSideBarHeader />
              <SidebarMenuItem>
                  <SidebarMenuButton isActive={pathname === '/studio'} tooltip='Conteúdo' asChild>
                    <Link prefetch  href='/studio/videos'>
                      <VideoIcon className='size-5' />
                      <span className='text-sm'>
                        Conteúdo
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Separator />
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip='Sair do Studio' asChild>
                    <Link prefetch  href='/'>
                      <LogOutIcon className='size-5' />
                      <span className='text-sm'>Sair do Studio</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
