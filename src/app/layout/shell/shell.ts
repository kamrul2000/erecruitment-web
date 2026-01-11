
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

  user = computed(() => this.auth.getCurrentUser());
  role = computed(() => this.user()?.role ?? '');

  pageTitle = signal('Dashboard');

  menu = computed(() => {
    const role = this.role();
    const items: { label: string; icon: string; path: string; roles?: string[] }[] = [
      { label: 'Dashboard', icon: 'dashboard', path: '/' },
      { label: 'Candidates', icon: 'person', path: '/candidates', roles: ['Admin', 'Recruiter', 'HiringManager'] },
      { label: 'Jobs', icon: 'work', path: '/jobs', roles: ['Admin', 'Recruiter', 'HiringManager'] },
      { label: 'Applications', icon: 'assignment', path: '/applications', roles: ['Admin', 'Recruiter', 'HiringManager'] },

      // Tenants usually admin-only
      { label: 'Tenants', icon: 'apartment', path: '/tenants', roles: ['Admin'] },
    ];

    return items.filter(i => !i.roles || i.roles.includes(role));
  });

  constructor(private auth: AuthService, private router: Router) {
    // Update title based on route
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.url;
      if (url.startsWith('/candidates')) this.pageTitle.set('Candidates');
      else if (url.startsWith('/jobs')) this.pageTitle.set('Jobs');
      else if (url.startsWith('/applications')) this.pageTitle.set('Applications');
      else if (url.startsWith('/tenants')) this.pageTitle.set('Tenants');
      else this.pageTitle.set('Dashboard');
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
}
