import React from 'react'
import { VideosSection } from '../sections/videos-section'

export const StudioView = () => {
  return (
    <div className='flex flex-col gap-y-6 pt-2.5'>
      <div className='px-4'>
        <h1 className='text-2xl font-bold'>
          Conteúdo do Canal
        </h1>
        <p className='text-xs text-muted-foreground'>
          Gerencia os vídeos e conteúdo do seu canal
        </p>
      </div>
      <VideosSection />
    </div>
  )
}