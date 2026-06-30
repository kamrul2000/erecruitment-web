import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { CommunicationsService } from '../../../core/services/communications.service';

@Component({
  selector: 'app-application-communication',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './application-communication.html',
  styles: [`
    .comm-wrap { padding: 12px 4px; display: flex; flex-direction: column; gap: 12px; }
    .comm-head { display: flex; align-items: center; justify-content: space-between; }
    .comm-head .h { font-weight: 600; font-size: 16px; }
    .form-card, .email-card { padding: 14px; }
    .grow { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .email-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .email-top .subj { font-weight: 600; }
    .email-top .meta { color: rgba(0,0,0,.6); font-size: 13px; margin-top: 2px; }
    .email-top .meta .type { font-weight: 500; }
    .err { color: #c62828; font-size: 13px; margin: 6px 0; }
    .body { white-space: pre-wrap; margin-top: 8px; color: rgba(0,0,0,.78); }
    .busy { display: flex; justify-content: center; padding: 16px; }
    .empty { color: rgba(0,0,0,.55); padding: 12px 4px; }
    .chip.sent { background: #e8f5e9; }
    .chip.failed { background: #fdecea; }
  `]
})
export class ApplicationCommunicationComponent implements OnChanges {
  @Input({ required: true }) applicationId!: string;

  loading = signal(false);
  sending = signal(false);
  emails = signal<any[]>([]);
  showForm = signal(false);

  form: FormGroup;

  constructor(
    private api: CommunicationsService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['applicationId'] && this.applicationId) this.load();
  }

  load() {
    if (!this.applicationId) return;
    this.loading.set(true);
    this.api.getByApplication(this.applicationId).subscribe({
      next: (res) => { this.emails.set(res ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Failed to load communication history', 'Close', { duration: 3000 }); }
    });
  }

  newEmail() { this.form.reset({ subject: '', body: '' }); this.showForm.set(true); }
  cancelForm() { this.showForm.set(false); }

  send() {
    if (this.form.invalid) { this.snack.open('Subject and message are required', 'Close', { duration: 2500 }); return; }
    const v = this.form.value;
    this.sending.set(true);
    this.api.send({ jobApplicationId: this.applicationId, subject: v.subject, body: v.body }).subscribe({
      next: (res) => {
        this.sending.set(false);
        this.showForm.set(false);
        if (res?.status === 'Failed') {
          this.snack.open('Saved, but delivery failed (check SMTP config)', 'Close', { duration: 4500 });
        } else {
          this.snack.open('Email sent', 'Close', { duration: 2500 });
        }
        this.load();
      },
      error: (err) => {
        this.sending.set(false);
        this.snack.open(typeof err?.error === 'string' ? err.error : 'Send failed', 'Close', { duration: 3500 });
      }
    });
  }

  chip(status: string) { return 'chip ' + (status || '').toLowerCase(); }

  label(t: string) {
    switch (t) {
      case 'ApplicationReceived': return 'Application received';
      case 'StatusChanged': return 'Status changed';
      case 'InterviewScheduled': return 'Interview scheduled';
      case 'InterviewCancelled': return 'Interview cancelled';
      case 'Custom': return 'Direct email';
      default: return t;
    }
  }
}
