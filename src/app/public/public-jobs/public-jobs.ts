import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  loading = signal(false);
  jobs = signal<any[]>([]);
  logo = signal<string | null>(null);
  companyName = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private api: PublicCareerService,
    private theme: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.slug = (this.route.snapshot.paramMap.get('slug') || '').toLowerCase();

    if (!this.slug) {
      return;
    }

    this.api.theme(this.slug).subscribe({
      next: (t) => {
        this.theme.apply(t);

        const logoPath = t?.logoUrl || null;
        if (logoPath) {
          const isAbsolute = /^https?:\/\//i.test(logoPath);
          const fullUrl = isAbsolute ? logoPath : `${environment.apiBaseUrl}${logoPath}`;
          this.logo.set(fullUrl);
        } else {
          this.logo.set(null);
        }

        this.companyName.set(t?.companyName ?? null);
      },
      error: () => {
        this.logo.set(null);
      }
    });

    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.jobs(this.slug).subscribe({
      next: (res) => {
        this.jobs.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.jobs.set([]);
      }
    });
  }

  open(job: any) {
    this.router.navigate([`/t/${this.slug}/jobs/${job.id}`]);
  }
}
