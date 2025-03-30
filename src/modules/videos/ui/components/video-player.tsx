"use client";
import MuxPlayer, { MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { THUMBNAIL_FALLBACK } from '../../constants';
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  playbackId?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
  autoPlay?: boolean;
  onPlay?: () => void;
};

export const VideoPlayerSkeleton = () => {
  return (
    <div className='aspect-video bg-black rounded-xl' />
  )
};

export const VideoPlayer = ({ playbackId, thumbnailUrl, autoPlay, onPlay }: VideoPlayerProps) => {
  const playerRef = useRef<MuxPlayerRefAttributes | null>(null);

  useEffect(() => {
    const updateTooltips = () => {
      if (!playerRef.current) return;

      const muxShadow = playerRef.current.shadowRoot;
      if (!muxShadow) return;

      const mediaTheme = muxShadow.querySelector("media-theme");
      if (!mediaTheme || !mediaTheme.shadowRoot) return;

      const mediaController = mediaTheme.shadowRoot.querySelector("media-controller");
      if (!mediaController || !mediaController.shadowRoot) return;

      const mediaControlBar = mediaController.querySelector('[part="control-bar bottom"]');
      if (!mediaControlBar) return;

      const mediaPlayButton = mediaControlBar.querySelector('[part="bottom play button"]');
      const mediaSeekBackwardButton = mediaControlBar.querySelector('[part="bottom seek-backward button"]');
      const mediaSeekForwardButton = mediaControlBar.querySelector('[part="bottom seek-forward button"]');
      const mediaMuteButton = mediaControlBar.querySelector('[part="bottom mute button"]');
      const mediaReditionButton = mediaControlBar.querySelector('[part="bottom rendition button"]');
      const mediaPlaybackButton = mediaControlBar.querySelector('[part="bottom playback-rate button"]');
      const mediaCaptionsButton = mediaControlBar.querySelector('[part="bottom captions button"]');
      const mediaPipButton = mediaControlBar.querySelector('[part="bottom pip button"]');
      const mediaFullScreenButton = mediaControlBar.querySelector('[part="bottom fullscreen button"]');

      if (
        !mediaPlayButton 
        || !mediaPlayButton.shadowRoot 
        || !mediaSeekBackwardButton 
        || !mediaSeekBackwardButton.shadowRoot 
        || !mediaSeekForwardButton 
        || !mediaSeekForwardButton.shadowRoot 
        || !mediaMuteButton 
        || !mediaMuteButton.shadowRoot
        || !mediaReditionButton
        || !mediaReditionButton.shadowRoot
        || !mediaPlaybackButton
        || !mediaPlaybackButton.shadowRoot
        || !mediaCaptionsButton
        || !mediaCaptionsButton.shadowRoot
        || !mediaPipButton
        || !mediaPipButton.shadowRoot
        || !mediaFullScreenButton
        || !mediaFullScreenButton.shadowRoot
       ) return;

      const tooltipSeekBackward = mediaSeekBackwardButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipSeekForward = mediaSeekForwardButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipMute = mediaMuteButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltip = mediaPlayButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipRedition = mediaReditionButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipPlayback = mediaPlaybackButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipCaptions = mediaCaptionsButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipPip = mediaPipButton.shadowRoot.querySelector('[part="tooltip"]');
      const tooltipFullScreen = mediaFullScreenButton.shadowRoot.querySelector('[part="tooltip"]');

      if (
        !tooltip 
        || !tooltipSeekBackward 
        || !tooltipSeekForward 
        || !tooltipMute
        || !tooltipRedition
        || !tooltipPlayback
        || !tooltipCaptions
        || !tooltipPip
        || !tooltipFullScreen
      ) return;

      const tooltipContent = tooltip.querySelector('[name="tooltip-content"]');
      const tooltipSeekBackwardContent = tooltipSeekBackward.querySelector('[name="tooltip-content"]');
      const tooltipSeekForwardContent = tooltipSeekForward.querySelector('[name="tooltip-content"]');
      const tooltipMuteContent = tooltipMute.querySelector('[name="tooltip-content"]');
      const tooltipReditionContent = tooltipRedition.querySelector('[name="tooltip-content"]');
      const tooltipPlaybackContent = tooltipPlayback.querySelector('[name="tooltip-content"]');
      const tooltipCaptionsContent = tooltipCaptions.querySelector('[name="tooltip-content"]');
      const tooltipPipContent = tooltipPip.querySelector('[name="tooltip-content"]');
      const tooltipFullScreenContent = tooltipFullScreen.querySelector('[name="tooltip-content"]');

      if (
        !tooltipContent 
        || !tooltipSeekBackwardContent 
        || !tooltipSeekForwardContent 
        || !tooltipMuteContent
        || !tooltipReditionContent
        || !tooltipPlaybackContent
        || !tooltipCaptionsContent
        || !tooltipPipContent
        || !tooltipFullScreenContent
      ) return;

      const tooltipPlay = tooltipContent.querySelector('[name="tooltip-play"]');
      const tooltipPause = tooltipContent.querySelector('[name="tooltip-pause"]');
      tooltipSeekBackwardContent.textContent = "Rebobinar 10 segundos";
      tooltipSeekForwardContent.textContent = "Avançar 10 segundos";
      tooltipReditionContent.textContent = "Qualidade";
      tooltipPlaybackContent.textContent = "Velocidade de reprodução";
      tooltipCaptionsContent.textContent = "Legendas";

      const tooltipMuteB = tooltipMuteContent.querySelector('[name="tooltip-mute"]');
      const tooltipUnmute = tooltipMuteContent.querySelector('[name="tooltip-unmute"]');
      const tooltipPipB = tooltipPipContent.querySelector('[name="tooltip-enter"]');
      const tooltipPipE = tooltipPipContent.querySelector('[name="tooltip-exit"]');
      const tooltipFullScreenE = tooltipFullScreenContent.querySelector('[name="tooltip-exit"]');
      const tooltipFullScreenF = tooltipFullScreenContent.querySelector('[name="tooltip-enter"]');

      if (
        !tooltipPlay 
        || !tooltipPause 
        || !tooltipMuteB 
        || !tooltipUnmute
        || !tooltipPipB
        || !tooltipPipE
        || !tooltipFullScreenE
        || !tooltipFullScreenF
      ) return;

      tooltipPlay.textContent = "Reproduzir";
      tooltipPause.textContent = "Pausar";
      tooltipMuteB.textContent = "Mudo";
      tooltipUnmute.textContent = "Desmutar";
      tooltipPipB.textContent = "Entrar no modo Picture-in-Picture";
      tooltipPipE.textContent = "Sair do modo Picture-in-Picture";
      tooltipFullScreenE.textContent = "Sair do modo tela cheia";
      tooltipFullScreenF.textContent = "Tela cheia";
    }

    updateTooltips();
  }, []);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={playbackId || ''}
      poster={thumbnailUrl || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoPlay}
      thumbnailTime={0}
      className='w-full h-full object-contain'
      accentColor='#FF2056'
      onPlay={onPlay}
      maxResolution='720p'
    />
  )
};