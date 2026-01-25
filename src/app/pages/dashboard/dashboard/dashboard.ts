import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CandidatesService } from '../../../core/services/candidates.service';
import { JobsService } from '../../../core/services/jobs.service';
import { ApplicationsService } from '../../../core/services/applications.service';
import { ApplicationFilterQuery } from '../../../core/models/api-models';

type SearchResult = { total: number; page?: number; pageSize?: number; items?: any[] };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  metricsLoading = signal(false);
  metricsError = signal('');

  candidatesCount = signal(0);

  jobsTotal = signal(0);
  jobsOpen = signal(0);
  jobsDraft = signal(0);
  jobsClosed = signal(0);

  applicationsTotal = signal(0);
  hiresCount = signal(0);

  constructor(
    private candidatesApi: CandidatesService,
    private jobsApi: JobsService,
    private appsApi: ApplicationsService
  ) {
    this.reload();
  }

  reload() {
    this.metricsLoading.set(true);
    this.metricsError.set('');

    let remaining = 4;
    const finalize = () => {
      remaining -= 1;
      if (remaining <= 0) {
        this.metricsLoading.set(false);
      }
    };

    this.candidatesApi.getAll().subscribe({
      next: res => {
        this.candidatesCount.set((res ?? []).length);
        finalize();
      },
      error: () => {
        this.metricsError.set('Some dashboard data failed to load');
        finalize();
      }
    });

    this.jobsApi.getAll().subscribe({
      next: res => {
        const list = res ?? [];
        this.jobsTotal.set(list.length);

        let open = 0;
        let draft = 0;
        let closed = 0;

        for (const j of list) {
          const status = (j.status || '').toLowerCase();
          if (status === 'published') open += 1;
          else if (status === 'draft') draft += 1;
          else if (status === 'closed') closed += 1;
        }

        this.jobsOpen.set(open);
        this.jobsDraft.set(draft);
        this.jobsClosed.set(closed);

        finalize();
      },
      error: () => {
        this.metricsError.set('Some dashboard data failed to load');
        finalize();
      }
    });

    this.appsApi.search({ page: 1, pageSize: 1 } as ApplicationFilterQuery).subscribe({
      next: (res: SearchResult) => {
        this.applicationsTotal.set(res?.total ?? 0);
        finalize();
      },
      error: () => {
        this.metricsError.set('Some dashboard data failed to load');
        finalize();
      }
    });

    this.appsApi
      .search({ status: 'Hired', page: 1, pageSize: 1 } as ApplicationFilterQuery)
      .subscribe({
        next: (res: SearchResult) => {
          this.hiresCount.set(res?.total ?? 0);
          finalize();
        },
        error: () => {
          this.metricsError.set('Some dashboard data failed to load');
          finalize();
        }
      });
  }
}
