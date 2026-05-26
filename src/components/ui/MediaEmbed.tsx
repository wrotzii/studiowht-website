import React, { useMemo } from 'react';

interface MediaEmbedProps {
  url: string;
  className?: string;
  alt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export const MediaEmbed: React.FC<MediaEmbedProps> = ({ url, className = '', alt = '', autoPlay = false, loop = false, muted = false }) => {
  const embedData = useMemo(() => {
    if (!url) return null;

    // Direct image
    if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || 
        url.startsWith('data:image/') || 
        url.includes('images.unsplash.com') ||
        url.includes('source.unsplash.com') ||
        url.includes('picsum.photos') ||
        url.includes('placeholder.com')) {
      return { type: 'image', src: url };
    }

    // Direct video
    if (url.match(/\.(mp4|webm|ogg)/i) || url.startsWith('/uploads/')) {
      // It might be a document from uploads actually, but for simplicity:
      if (url.match(/\.pdf$/i)) return { type: 'document', src: url };
      return { type: 'video', src: url };
    }

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      const videoId = ytMatch[1];
      let src = `https://www.youtube-nocookie.com/embed/${videoId}?`;
      const params = new URLSearchParams();
      if (autoPlay) params.set('autoplay', '1');
      if (muted) params.set('mute', '1');
      if (loop) {
        params.set('loop', '1');
        params.set('playlist', videoId);
      }
      params.set('controls', autoPlay ? '0' : '1');
      params.set('rel', '0');
      return { type: 'youtube', src: src + params.toString() };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      let src = `https://player.vimeo.com/video/${videoId}?`;
      const params = new URLSearchParams();
      if (autoPlay) params.set('autoplay', '1');
      if (muted) params.set('muted', '1');
      if (loop) params.set('loop', '1');
      if (autoPlay) params.set('background', '1'); // Vimeo specific for background videos
      return { type: 'vimeo', src: src + params.toString() };
    }

    // Google Drive (Video or Images)
    // Extract ID and use preview or uc endpoint
    const gdriveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([-\w]+)/);
    if (gdriveMatch) {
      // Unfortunately we don't know if it's image or video, but iframe handles it okay.
      return { type: 'iframe', src: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview` };
    }

    // Default to a generic iframe if not recognized but starts with http
    if (url.startsWith('http')) {
      return { type: 'iframe', src: url };
    }

    return null;
  }, [url, autoPlay, loop, muted]);

  if (!embedData) return null;

  switch (embedData.type) {
    case 'image':
      return <img src={embedData.src} alt={alt} className={className} loading="lazy" />;
    case 'video':
      return (
        <video
          src={embedData.src}
          className={className}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={autoPlay}
        />
      );
    case 'youtube':
    case 'vimeo':
    case 'iframe':
      return (
        <iframe
          src={embedData.src}
          className={`${className} border-0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={alt || "Media Embed"}
        />
      );
    case 'document':
      return (
        <div className={`flex flex-col items-center justify-center bg-zinc-900 border border-white/10 ${className}`}>
           <p className="text-white mb-2">Embedded Document</p>
           <a href={embedData.src} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Open File</a>
        </div>
      );
    default:
      return null;
  }
};
