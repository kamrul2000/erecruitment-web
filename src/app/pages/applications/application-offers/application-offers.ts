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

import { OffersService } from '../../../core/services/offers.service';

type OfferAction = 'send' | 'accept' | 'decline' | 'withdraw';

@Component({
  selector: 'app-application-offers',
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
  templateUrl: './application-offers.html',
  styles: [`
    .offers-wrap { padding: 12px 4px; display: flex; flex-direction: column; gap: 12px; }
    .offers-head { display: flex; align-items: center; justify-content: space-between; }
    .offers-head .h { font-weight: 600; font-size: 16px; }
    .form-card, .offer-card { padding: 14px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    .grow { flex: 1 1 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .offer-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .offer-top .pos { font-weight: 600; }
    .offer-top .meta { color: rgba(0,0,0,.6); font-size: 13px; margin-top: 2px; }
    .notes { margin: 8px 0; white-space: pre-wrap; }
    .resp { margin: 4px 0 8px; font-style: italic; color: rgba(0,0,0,.6); }
    .offer-actions { display: flex; gap: 4px; flex-wrap: wrap; padding-top: 8px; }
    .terminal { color: rgba(0,0,0,.45); font-size: 13px; padding: 6px 4px; }
    .busy { display: flex; justify-content: center; padding: 16px; }
    .empty { color: rgba(0,0,0,.55); padding: 12px 4px; }
    .chip.draft { background: #eceff1; }
    .chip.sent { background: #e3f2fd; }
    .chip.accepted { background: #e8f5e9; }
    .chip.declined, .chip.withdrawn, .chip.expired { background: #fdecea; }
  `]
})
export class ApplicationOffersComponent implements OnChanges {
  @Input({ required: true }) applicationId!: string;

  loading = signal(false);
  saving = signal(false);
  offers = signal<any[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  form: FormGroup;

  private static readonly CONFIRM: Record<OfferAction, string> = {
    send: 'Send this offer to the candidate?',
    accept: 'Mark this offer as Accepted? This moves the application to Hired.',
    decline: 'Mark this offer as Declined?',
    withdraw: 'Withdraw this offer?'
  };
  private static readonly DONE: Record<OfferAction, string> = {
    send: 'Offer sent',
    accept: 'Offer accepted',
    decline: 'Offer declined',
    withdraw: 'Offer withdrawn'
  };

  constructor(
    private api: OffersService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      positionTitle: ['', Validators.required],
      salary: [null as number | null],
      salaryCurrency: ['BDT'],
      startDate: [null as string | null],
      expiresAt: [null as string | null],
      notes: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['applicationId'] && this.applicationId) this.load();
  }

  load() {
    if (!this.applicationId) return;
    this.loading.set(true);
    this.api.getByApplication(this.applicationId).subscribe({
      next: (res) => { this.offers.set(res ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Failed to load offers', 'Close', { duration: 3000 }); }
    });
  }

  newOffer() {
    this.editingId.set(null);
    this.form.reset({ positionTitle: '', salary: null, salaryCurrency: 'BDT', startDate: null, expiresAt: null, notes: '' });
    this.showForm.set(true);
  }

  edit(o: any) {
    this.editingId.set(o.id);
    this.form.reset({
      positionTitle: o.positionTitle,
      salary: o.salary ?? null,
      salaryCurrency: o.salaryCurrency || 'BDT',
      startDate: o.startDate ? String(o.startDate).substring(0, 10) : null,
      expiresAt: o.expiresAt ? String(o.expiresAt).substring(0, 10) : null,
      notes: o.notes || ''
    });
    this.showForm.set(true);
  }

  cancelForm() { this.showForm.set(false); this.editingId.set(null); }

  submit() {
    if (this.form.invalid) { this.snack.open('Position title is required', 'Close', { duration: 2500 }); return; }
    const v = this.form.value;
    const payload: any = {
      positionTitle: v.positionTitle,
      salary: (v.salary === null || v.salary === '' ) ? null : Number(v.salary),
      salaryCurrency: v.salaryCurrency || 'BDT',
      startDate: v.startDate || null,
      expiresAt: v.expiresAt || null,
      notes: v.notes || null
    };

    this.saving.set(true);
    const id = this.editingId();
    const req = id
      ? this.api.update(id, payload)
      : this.api.create({ ...payload, jobApplicationId: this.applicationId });

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.snack.open(id ? 'Offer updated' : 'Offer created', 'Close', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(typeof err?.error === 'string' ? err.error : 'Save failed', 'Close', { duration: 3500 });
      }
    });
  }

  act(o: any, action: OfferAction) {
    if (!confirm(ApplicationOffersComponent.CONFIRM[action])) return;
    const req =
      action === 'send' ? this.api.send(o.id)
      : action === 'accept' ? this.api.accept(o.id, {})
      : action === 'decline' ? this.api.decline(o.id, {})
      : this.api.withdraw(o.id);

    req.subscribe({
      next: () => { this.snack.open(ApplicationOffersComponent.DONE[action], 'Close', { duration: 2500 }); this.load(); },
      error: (err: any) => { this.snack.open(typeof err?.error === 'string' ? err.error : 'Action failed', 'Close', { duration: 3500 }); }
    });
  }

  chip(status: string) {
    return 'chip ' + (status || '').toLowerCase();
  }
}
