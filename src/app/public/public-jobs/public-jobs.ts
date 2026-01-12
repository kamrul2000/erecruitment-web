import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PublicCareerService } from '../../core/services/public-career.service';

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

  constructor(
    private route: ActivatedRoute,
    private api: PublicCareerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.slug = (this.route.snapshot.paramMap.get('slug') || '').toLowerCase();
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
