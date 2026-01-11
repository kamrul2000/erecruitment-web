import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsService } from '../../../core/services/jobs.service';
import { JobPosting } from '../../../core/models/api-models';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { JobDialogComponent } from './../job-dialog/job-dialog';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './jobs.html',
  styleUrl: './jobs.scss'
})
export class JobsComponent {
  loading = signal(false);
  search = signal('');
  jobs = signal<JobPosting[]>([]);

  displayedColumns = ['title', 'department', 'location', 'status', 'createdAt', 'actions'];

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.jobs();

    return this.jobs().filter(j =>
      (j.title ?? '').toLowerCase().includes(q) ||
      (j.department ?? '').toLowerCase().includes(q) ||
      (j.location ?? '').toLowerCase().includes(q) ||
      (j.status ?? '').toLowerCase().includes(q)
    );
  });

  constructor(
    private api: JobsService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (res) => {
        this.jobs.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load jobs', 'Close', { duration: 3000 });
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open(JobDialogComponent, {
      width: '760px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'refresh') this.load();
    });
  }

  openEdit(job: JobPosting) {
    const ref = this.dialog.open(JobDialogComponent, {
      width: '760px',
      data: { mode: 'edit', job }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'refresh') this.load();
    });
  }

  delete(job: JobPosting) {
    const ok = confirm(`Delete job: ${job.title}?`);
    if (!ok) return;

    this.api.delete(job.id).subscribe({
      next: () => {
        this.snack.open('Job deleted', 'Close', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Delete failed', 'Close', { duration: 3000 })
    });
  }

  statusClass(status: string) {
    const s = (status || '').toLowerCase();
    if (s === 'published') return 'published';
    if (s === 'closed') return 'closed';
    return 'draft';
  }
}
