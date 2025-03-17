import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDuration = (duration: number) => {
  const seconds = Math.floor((duration % 60000)  / 1000);
  const minutes = Math.floor(duration / 60000);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const snakeCaseToTitleCase = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const translateMuxStatus = (status: string) => {
  switch (status) {
    case 'ready':
      return 'Pronto';
    case 'waiting':
      return 'Aguardando';
    case 'preparing':
      return 'Preparando';
    case 'error':
      return 'Erro';
    case 'no_audio':
      return 'Sem áudio';
    default:
      return status;
  }
};

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();