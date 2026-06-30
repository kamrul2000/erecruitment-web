import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidatesService } from '../../../core/services/candidates.service';
import { Candidate } from '../../../core/models/api-models';

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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { CandidateDialogComponent } from '../candidate-dialog/candidate-dialog';
import { openBlobInWindow } from '../../../core/utils/file-open';

@Component({
  selector: 'app-candidates',
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
    MatPaginatorModule
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss'
})
export class CandidatesComponent {
  loading = signal(false);
  search = signal('');

  candidates = signal<Candidate[]>([]);
  total = signal(0);
  pageIndex = signal(0);     // 0-based, for mat-paginator
  pageSize = signal(20);
  displayedColumns = ['fullName', 'email', 'phone', 'experience', 'salary', 'resume', 'actions'];

  // Server already applies search + pagination; keep the template binding stable.
  filtered = computed(() => this.candidates());

  private searchTimer: any = null;

  constructor(
    private api: CandidatesService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAll(this.pageIndex() + 1, this.pageSize(), this.search().trim()).subscribe({
      next: (res) => {
        this.candidates.set(res?.items ?? []);
        this.total.set(res?.total ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load candidates', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch(value: string) {
    this.search.set(value);
    this.pageIndex.set(0); // new search starts on the first page
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 300);
  }

  onPage(e: PageEvent) {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  openCreate() {
    const ref = this.dialog.open(CandidateDialogComponent, {
      width: '720px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') this.load();
    });
  }

  openEdit(candidate: Candidate) {
    const ref = this.dialog.open(CandidateDialogComponent, {
      width: '720px',
      data: { mode: 'edit', candidate }
    });

    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') this.load();
    });
  }

  delete(candidate: Candidate) {
    const ok = confirm(`Delete candidate: ${candidate.fullName}?`);
    if (!ok) return;

    this.api.delete(candidate.id).subscribe({
      next: () => {
        this.snack.open('Deleted', 'Close', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Delete failed', 'Close', { duration: 3000 })
    });
  }


  openResume(candidate: any) {
    if (!candidate?.id) {
      this.snack.open('Resume not available', 'Close', { duration: 2500 });
      return;
    }
    // Open the tab synchronously (within the click) so popup blockers allow it,
    // then redirect it to the fetched CV blob.
    const win = window.open('', '_blank');
    this.api.viewResume(candidate.id).subscribe({
      next: (blob) => openBlobInWindow(blob, win),
      error: () => {
        win?.close();
        this.snack.open('Resume not available', 'Close', { duration: 2500 });
      }
    });
  }
}
