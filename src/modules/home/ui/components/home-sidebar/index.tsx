import { Sidebar, SidebarContent, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import MainSection from './main-section'
import { Separator } from '@/components/ui/separator'
import PersonalSection from './personal-section'
import Image from 'next/image'
import Link from 'next/link'

export default function HomeSidebar() {
  return (
    <Sidebar className='pt-16 z-40 border-none' collapsible='icon'>
      <SidebarContent className='bg-background'>
        <div className="flex items-center flex-shrink-0 px-2.5 md:hidden">
          <SidebarTrigger className='pt-4' />
          <Link href="/">
            <div className="p-3 pb-0 flex gap-1 cursor-pointer">
              <Image src="/logo.svg" alt="logo" width={32} height={32} />
              <p className="text-xl font-semibold tracking-tighter">Zylo</p>
            </div>
          </Link>
        </div>
        <MainSection />
        <Separator />
        <PersonalSection />
      </SidebarContent>
    </Sidebar>
  )
}
