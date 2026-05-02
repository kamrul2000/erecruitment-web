import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  apply(theme: any) {
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', theme.primaryColor || '#1976d2');
    root.style.setProperty('--brand-secondary', theme.secondaryColor || '#9c27b0');
    root.style.setProperty('--brand-bg', theme.backgroundColor || '#ffffff');
    root.style.setProperty('--brand-font', theme.fontFamily || 'Inter, system-ui, Arial');

    // Logo variable
    if (theme.logoUrl) {
      root.style.setProperty('--brand-logo', `url('${this.toAbsolute(theme.logoUrl)}')`);
    }

    // Favicon
    if (theme.faviconUrl) {
      this.setFavicon(this.toAbsolute(theme.faviconUrl));
    }

    // Custom CSS
    if (theme.customCss) {
      this.injectCustomCss(theme.customCss);
    }
  }

  // Backend stores asset paths like "/uploads/{tenantId}/branding/logo.png".
  // The SPA is served from a different origin than the API in dev, so we
  // must prepend the API base URL for relative paths.
  private toAbsolute(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return `${environment.apiBaseUrl}${url}`;
  }

  private setFavicon(url: string) {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  private injectCustomCss(css: string) {
    const id = 'tenant-custom-css';
    document.getElementById(id)?.remove();
    const style = document.createElement('style');
    style.id = id;
    style.innerText = css;
    document.head.appendChild(style);
  }
}
