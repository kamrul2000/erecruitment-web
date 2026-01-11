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

import { CandidateDialogComponent } from '../candidate-dialog/candidate-dialog';

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
    MatTooltipModule
  ],
  templateUrl: './candidates.html',
  styleUrl: './candidates.scss'
})
export class CandidatesComponent {
  loading = signal(false);
  search = signal('');

  candidates = signal<Candidate[]>([]);
  displayedColumns = ['fullName', 'email', 'phone', 'experience', 'salary', 'resume', 'actions'];

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.candidates();

    return this.candidates().filter(c =>
      (c.fullName ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q) ||
      (c.addressLine ?? '').toLowerCase().includes(q)
    );
  });

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
    this.api.getAll().subscribe({
      next: (res: any) => {
        // Your backend currently returns CandidateResponse (limited fields) OR full Candidate entity
        // If it's CandidateResponse, some columns may show empty; it's okay.
        this.candidates.set(res ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load candidates', 'Close', { duration: 3000 });
      }
    });
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

  uploadResume(candidate: Candidate) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      this.api.uploadResume(candidate.id, file).subscribe({
        next: () => {
          this.snack.open('Resume uploaded', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Upload failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    };

    input.click();
  }

  openResume(candidate: any) {
    // backend stores ResumeUrl like /uploads/{tenantId}/candidates/{id}/file.pdf
    if (!candidate.resumeUrl) return;
    window.open(`https://localhost:7289${candidate.resumeUrl}`, '_blank');
  }
}
