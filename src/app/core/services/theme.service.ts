import { Injectable } from '@angular/core';
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
      root.style.setProperty('--brand-logo', `url('${theme.logoUrl}')`);
    }

    // Favicon
    if (theme.faviconUrl) {
      this.setFavicon(theme.faviconUrl);
    }

    // Custom CSS
    if (theme.customCss) {
      this.injectCustomCss(theme.customCss);
    }
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
