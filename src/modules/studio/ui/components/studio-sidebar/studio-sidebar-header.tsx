import { SidebarHeader, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useUser } from '@clerk/nextjs'
import Link from 'next/link';
import React from 'react'

const StudioSideBarHeader = () => {
  const { user } = useUser();
  const {state} = useSidebar();

  if (!user) {
    return (
      <SidebarHeader className='flez items-center justify-center pb-4'>
        <Skeleton className='size-[112px] rounded-full' />
        <div className='flex flex-col items-center mt-2 gap-y-2'>
          <Skeleton className='w-[80px] h-4' />
          <Skeleton className='w-[100px] h-4' />
        </div>
      </SidebarHeader>
    )
  }

  if (state === 'collapsed') {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip='Seu perfil' asChild>
        <Link href='/users/current'>
          <UserAvatar 
          imageUrl={user?.imageUrl}
           name={user?.fullName ?? 'User'} 
           size='xs' />
           <span className='text-sm'>Seu perfil</span>
        </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarHeader className='flez items-center justify-center pb-4'>
      <Link href='/users/current'>
        <UserAvatar imageUrl={user?.imageUrl} name={user?.fullName ?? 'User'} size='lg' className='size-[112px] hover:opacity-80 transition-opacity' />
      </Link>
      <div className='flex flex-col items-center mt-2 gap-y-1'>
        <p className='text-sm font-medium'>
          Seu Perfil
        </p>
        <p className='text-xs text-muted-foreground'>
          {user?.fullName}
        </p>
      </div>
    </SidebarHeader>
  )
}

export default StudioSideBarHeader