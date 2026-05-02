import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

import { ThemeService } from '../../../app/core/services/theme.service';
import { PublicCareerService } from '../../../app/core/services/public-career.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-jobs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './public-jobs.html',
  styleUrl: './public-jobs.scss'
})
export class PublicJobsComponent {
  slug = '';
  loading = signal(true);
  notFound = signal(false);
  jobs = signal<any[]>([]);
  logo = signal<string | null>(null);
  companyName = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private api: PublicCareerService,
    private theme: ThemeService,
    private router: Router,
    private title: Title
  ) {}

  ngOnInit() {
    this.slug = (this.route.snapshot.paramMap.get('slug') || '').toLowerCase();

    if (!this.slug) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    // Theme + jobs in parallel — show "not found" if either endpoint returns 404
    // (e.g. unknown slug or disabled tenant). The two calls are independent so we
    // start them together rather than serially.
    forkJoin({
      theme: this.api.theme(this.slug),
      jobs: this.api.jobs(this.slug)
    }).subscribe({
      next: ({ theme, jobs }) => {
        this.theme.apply(theme);

        const logoPath = theme?.logoUrl || null;
        if (logoPath) {
          const isAbsolute = /^https?:\/\//i.test(logoPath);
          this.logo.set(isAbsolute ? logoPath : `${environment.apiBaseUrl}${logoPath}`);
        }

        const company = theme?.companyName ?? null;
        this.companyName.set(company);
        this.title.setTitle(company ? `Careers at ${company}` : 'Careers');

        this.jobs.set(jobs ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
        this.title.setTitle('Careers — not available');
      }
    });
  }

  open(job: any) {
    this.router.navigate([`/t/${this.slug}/jobs/${job.id}`]);
  }
}
