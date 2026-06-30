import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { ApplicationsService } from '../../../core/services/applications.service';
import { JobsService } from '../../../core/services/jobs.service';
import { CandidatesService } from '../../../core/services/candidates.service';
import { ApplicationFilterQuery, JobPosting } from '../../../core/models/api-models';
import { openBlobInWindow } from '../../../core/utils/file-open';

import { StatusDialogComponent } from './../status-dialog/status-dialog';
import { HistoryDialogComponent } from './../history-dialog/history-dialog';
import { ApplicationDetailsDialogComponent } from '../application-details-dialog/application-details-dialog';
type SearchResult = { total: number; page: number; pageSize: number; items: any[] };

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './applications.html',
  styleUrl: './applications.scss'
})
export class ApplicationsComponent {
  loading = signal(false);

  // tabs: 0 = Global search, 1 = By job pipeline
  tabIndex = signal(0);

  jobs = signal<JobPosting[]>([]);
  selectedJobId = signal<string>('');

  page = signal(1);
  pageSize = signal(20);
  total = signal(0);

  items = signal<any[]>([]);
  displayedColumns = ['candidate', 'job', 'status', 'salary', 'experience', 'createdAt', 'actions'];

  statuses = ['Submitted', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];
  sortByOptions = [
    { value: 'createdAt', label: 'Created' },
    { value: 'salary', label: 'Salary' },
    { value: 'experience', label: 'Experience' }
  ];

  filterForm: FormGroup;

  activeJobTitle = computed(() => {
    const id = this.selectedJobId();
    return this.jobs().find(j => j.id === id)?.title ?? '';
  });

  constructor(
    private fb: FormBuilder,
    private appsApi: ApplicationsService,
    private jobsApi: JobsService,
    private candidatesApi: CandidatesService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      status: [[] as string[]],
      keyword: [''],
      minSalary: [null as number | null],
      maxSalary: [null as number | null],
      minExperienceYears: [null as number | null],
      maxExperienceYears: [null as number | null],
      sortBy: ['createdAt'],
      sortOrder: ['desc']
    });
  }

  ngOnInit() {
    this.loadJobs();
    this.runSearch(); // global search initial
  }

  loadJobs() {
    // Pipeline job selector — load up to 100 jobs (newest first).
    this.jobsApi.getAll(1, 100).subscribe({
      next: (res) => this.jobs.set(res?.items ?? []),
      error: () => this.snack.open('Failed to load jobs', 'Close', { duration: 3000 })
    });
  }

  onTabChange(index: number) {
    this.tabIndex.set(index);
    this.page.set(1);
    this.total.set(0);
    this.items.set([]);

    // run search for tab
    this.runSearch();
  }

  resetFilters() {
    this.filterForm.reset({
      status: [],
      keyword: '',
      minSalary: null,
      maxSalary: null,
      minExperienceYears: null,
      maxExperienceYears: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    this.page.set(1);
    this.runSearch();
  }

  buildQuery(): ApplicationFilterQuery {
    const v = this.filterForm.getRawValue();

    return {
      status: (v.status && v.status.length) ? v.status.join(',') : undefined,
      keyword: v.keyword?.trim() || undefined,
      minSalary: v.minSalary ?? undefined,
      maxSalary: v.maxSalary ?? undefined,
      minExperienceYears: v.minExperienceYears ?? undefined,
      maxExperienceYears: v.maxExperienceYears ?? undefined,
      page: this.page(),
      pageSize: this.pageSize(),
      sortBy: v.sortBy ?? 'createdAt',
      sortOrder: v.sortOrder ?? 'desc'
    };
  }

  runSearch() {
    this.loading.set(true);

    const query = this.buildQuery();
    const tab = this.tabIndex();

    const req$ =
      tab === 0
        ? this.appsApi.search(query)
        : this.appsApi.byJobSearch(this.selectedJobId(), query);

    req$.subscribe({
      next: (res: SearchResult) => {
        this.total.set(res?.total ?? 0);
        this.items.set(res?.items ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Search failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  onPage(e: PageEvent) {
    this.page.set(e.pageIndex + 1);
    this.pageSize.set(e.pageSize);
    this.runSearch();
  }

  statusClass(status: string) {
    const s = (status || '').toLowerCase();
    if (s === 'shortlisted') return 'shortlisted';
    if (s === 'rejected') return 'rejected';
    if (s === 'hired') return 'hired';
    if (s === 'reviewed') return 'reviewed';
    return 'submitted';
  }

  //  openResume(candidate: any) {
  //   // backend stores ResumeUrl like /uploads/{tenantId}/candidates/{id}/file.pdf
  //   if (!candidate.resumeUrl) return;
  //       window.open(`${environment.apiBaseUrl}${candidate.resumeUrl}`, '_blank');

  // }
 openResume(row: any) {
  if (!row?.candidateId) {
    this.snack.open('Resume not available', 'Close', { duration: 2500 });
    return;
  }
  // Open the tab synchronously (within the click) so popup blockers allow it,
  // then redirect it to the fetched CV blob from the protected endpoint.
  const win = window.open('', '_blank');
  this.candidatesApi.viewResume(row.candidateId).subscribe({
    next: (blob) => openBlobInWindow(blob, win),
    error: () => {
      win?.close();
      this.snack.open('Resume not available', 'Close', { duration: 2500 });
    }
  });
}


openDetails(row: any) {
  const ref = this.dialog.open(ApplicationDetailsDialogComponent, {
    width: '1100px',
    maxWidth: '95vw',
    data: { application: row }
  });
}
  openHistory(row: any) {
    this.appsApi.history(row.applicationId || row.id).subscribe({
      next: (items) => {
        this.dialog.open(HistoryDialogComponent, {
          width: '680px',
          data: { app: row, items: items ?? [] }
        });
      },
      error: () => this.snack.open('Failed to load history', 'Close', { duration: 3000 })
    });
  }

  changeStatus(row: any) {
    const ref = this.dialog.open(StatusDialogComponent, {
      width: '520px',
      data: { current: row.status, statuses: this.statuses }
    });

    ref.afterClosed().subscribe((result: { status: string; notes?: string } | null) => {
      if (!result) return;

      const id = row.applicationId || row.id;
      this.appsApi.updateStatus(id, result).subscribe({
        next: () => {
          this.snack.open('Status updated', 'Close', { duration: 2500 });
          this.runSearch();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Update failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }
}
