import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { JobsService } from '../../../core/services/jobs.service';
import { JobPosting } from '../../../core/models/api-models';

@Component({
  selector: 'app-job-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './job-dialog.html',
  styleUrl: './job-dialog.scss'
})
export class JobDialogComponent {
  loading = signal(false);

  mode: 'create' | 'edit';
  job?: JobPosting;

  statuses = ['Draft', 'Published', 'Closed'];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: JobsService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<JobDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      department: ['', [Validators.required]],
      location: [''],
      description: [''],
      status: ['Draft', [Validators.required]]
    });

    this.mode = data?.mode ?? 'create';
    this.job = data?.job;

    if (this.mode === 'edit' && this.job) {
      this.form.patchValue({
        title: this.job.title ?? '',
        department: this.job.department ?? '',
        location: this.job.location ?? '',
        description: this.job.description ?? '',
        status: this.job.status ?? 'Draft'
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const payload = this.form.getRawValue();

    if (this.mode === 'create') {
      this.api.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('Job created', 'Close', { duration: 2500 });
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.loading.set(false);
          const msg = typeof err?.error === 'string' ? err.error : 'Create failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    } else {
      this.api.update(this.job!.id, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('Job updated', 'Close', { duration: 2500 });
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.loading.set(false);
          const msg = typeof err?.error === 'string' ? err.error : 'Update failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
