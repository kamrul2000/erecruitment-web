import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PublicCareerService } from '../../core/services/public-career.service';

@Component({
  selector: 'app-public-job-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './public-job-details.html',
  styleUrl: './public-job-details.scss'
})
export class PublicJobDetailsComponent {
  slug = '';
  jobId = '';
  loading = signal(false);
  submitting = signal(false);

  job = signal<any>(null);
  resumeFile = signal<File | null>(null);

  form;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: PublicCareerService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      addressLine: [''],
      previousCompanyName: [''],
      noOfYearExperience: [null as number | null],
      instituteName: [''],
      subject: [''],
      expectedSalary: [null as number | null],
      salaryCurrency: ['BDT'],
      notes: ['']
    });
  }

  ngOnInit() {
    this.slug = (this.route.snapshot.paramMap.get('slug') || '').toLowerCase();
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.job(this.slug, this.jobId).subscribe({
      next: (res) => {
        this.job.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Job not found', 'Close', { duration: 3000 });
      }
    });
  }

  pickFile(ev: any) {
    const file = ev?.target?.files?.[0] as File | undefined;
    this.resumeFile.set(file ?? null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.resumeFile()) {
      this.snack.open('Please upload your CV (pdf/doc/docx)', 'Close', { duration: 3000 });
      return;
    }

    const fd = new FormData();
    const v = this.form.getRawValue();

    Object.entries(v).forEach(([k, val]) => {
      if (val === null || val === undefined) return;
      fd.append(k, String(val));
    });

    fd.append('resume', this.resumeFile()!, this.resumeFile()!.name);

    this.submitting.set(true);
    this.api.apply(this.slug, this.jobId, fd).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snack.open('Application submitted successfully', 'Close', { duration: 3500 });
        this.form.reset({ salaryCurrency: 'BDT' });
        this.resumeFile.set(null);
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Submit failed';
        this.snack.open(msg, 'Close', { duration: 4000 });
      }
    });
  }
}
