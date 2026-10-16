import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

@Injectable({ providedIn: 'root' })
export class MediaUrlService {
  private readonly sanitizer = inject(DomSanitizer);

  youtubeEmbedUrl(value: string | null | undefined): SafeResourceUrl | null {
    const videoId = this.youtubeVideoId(value);
    if (!videoId) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${videoId}`);
  }

  safeNativeMediaUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.startsWith('blob:')) return value;

    try {
      const url = new URL(value, document.baseURI);
      return url.protocol === 'https:' || (url.protocol === 'http:' && this.isLocalHost(url.hostname))
        ? url.toString()
        : null;
    } catch {
      return null;
    }
  }

  private youtubeVideoId(value: string | null | undefined): string | null {
    if (!value) return null;
    try {
      const url = new URL(value);
      const hostname = url.hostname.toLowerCase();
      if (!YOUTUBE_HOSTS.has(hostname)) return null;
      const candidate = hostname.endsWith('youtu.be')
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.searchParams.get('v') ?? url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
      return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
    } catch {
      return null;
    }
  }

  private isLocalHost(hostname: string): boolean {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  }
}
