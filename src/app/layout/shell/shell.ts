
import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class ShellComponent {
  isSidenavOpen = signal(true);
  activeUrl = signal('/');

  user = computed(() => this.auth.getCurrentUser());
  role = computed(() => this.user()?.role ?? '');

  menu = computed(() => {
    const role = this.role();
    const items: { label: string; icon: string; path: string; roles?: string[] }[] = [
      { label: 'Dashboard', icon: 'dashboard', path: '/' },
      { label: 'Candidates', icon: 'person', path: '/candidates', roles: ['Admin', 'Recruiter', 'HiringManager'] },
      { label: 'Jobs', icon: 'work', path: '/jobs', roles: ['Admin', 'Recruiter', 'HiringManager'] },
      { label: 'Applications', icon: 'assignment', path: '/applications', roles: ['Admin', 'Recruiter', 'HiringManager'] },

      // Tenants usually admin-only
      { label: 'Tenants', icon: 'apartment', path: '/tenants', roles: ['Admin'] },
      { label: 'Users', icon: 'group', path: '/users', roles: ['Admin'] },
      { label: 'Settings', icon: 'settings', path: '/settings', roles: ['Admin'] },
      { label: 'Audit Logs', icon: 'receipt_long', path: '/audit-logs', roles: ['Admin'] },
      { label: 'Branding', icon: 'palette', path: '/settings/branding', roles: ['Admin'] },

//super admin only
      { label: 'Tenants', icon: 'domain', path: '/saas/tenants', roles: ['SuperAdmin'] },


    ];

    return items.filter(i => !i.roles || i.roles.includes(role));
  });

  // The active menu path = the longest menu path that matches the current URL,
  // so /settings/branding highlights "Branding" rather than both it and "Settings".
  activePath = computed(() => {
    const url = this.activeUrl();
    const matches = this.menu().filter(i =>
      (i.path === '/' && url === '/') ||
      (i.path !== '/' && (url === i.path || url.startsWith(i.path + '/')))
    );
    if (!matches.length) return '/';
    return matches.reduce((a, b) => (b.path.length > a.path.length ? b : a)).path;
  });

  pageTitle = computed(() => this.menu().find(i => i.path === this.activePath())?.label ?? 'Dashboard');

  constructor(private auth: AuthService, private router: Router) {
    this.activeUrl.set(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.activeUrl.set(this.router.url);
    });
  }

  toggleSidenav() {
    this.isSidenavOpen.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  go(path: string) {
    this.router.navigate([path]);
  }

  initials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || '?';
  }
}
