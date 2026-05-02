import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

import { ThemeService } from '../../../app/core/services/theme.service';
import { PublicCareerService } from '../../../app/core/services/public-career.service';

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_RESUME_EXTS = ['pdf', 'doc', 'docx'];
const ALLOWED_RESUME_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

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
  notFound = signal(false);
  submitted = signal(false);
  referenceCode = signal<string | null>(null);
  resumeError = signal<string | null>(null);

  job = signal<any>(null);
  resumeFile = signal<File | null>(null);
  companyName = signal<string | null>(null);
  logo = signal<string | null>(null);

  form;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private api: PublicCareerService,
    private theme: ThemeService,
    private snack: MatSnackBar,
    private title: Title
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

    if (this.slug) {
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

          const company = t?.companyName ?? null;
          this.companyName.set(company);
          this.title.setTitle(company ? `Apply — ${company}` : 'Apply');
        },
        error: () => {}
      });
    }

    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.job(this.slug, this.jobId).subscribe({
      next: (res) => {
        this.job.set(res);
        this.loading.set(false);
        const job = res;
        const company = this.companyName();
        if (job?.title) {
          this.title.setTitle(company ? `${job.title} — ${company}` : job.title);
        }
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      }
    });
  }

  pickFile(ev: any) {
    const file = ev?.target?.files?.[0] as File | undefined;
    this.resumeError.set(null);

    if (!file) {
      this.resumeFile.set(null);
      return;
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const mime = (file.type || '').toLowerCase();

    if (!ALLOWED_RESUME_EXTS.includes(ext) ||
        (mime && !ALLOWED_RESUME_MIME.includes(mime))) {
      this.resumeError.set('Only PDF, DOC, and DOCX files are accepted.');
      this.resumeFile.set(null);
      return;
    }

    if (file.size > MAX_RESUME_BYTES) {
      this.resumeError.set('File is too large. Max size is 10 MB.');
      this.resumeFile.set(null);
      return;
    }

    this.resumeFile.set(file);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.resumeFile()) {
      this.resumeError.set('Please upload your CV (pdf/doc/docx).');
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
      next: (res) => {
        this.submitting.set(false);
        this.referenceCode.set(res?.referenceCode ?? null);
        this.submitted.set(true);
        this.form.reset({ salaryCurrency: 'BDT' });
        this.resumeFile.set(null);
        this.resumeError.set(null);
      },
      error: (err) => {
        this.submitting.set(false);
        const body = err?.error;
        const msg =
          (body && typeof body === 'object' && body.error) ? body.error :
          typeof body === 'string' ? body :
          'Submit failed';
        this.snack.open(msg, 'Close', { duration: 4000 });
      }
    });
  }

  applyAgain() {
    this.submitted.set(false);
    this.referenceCode.set(null);
  }
}
