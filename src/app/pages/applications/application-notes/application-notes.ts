import { Component, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotesService } from '../../../core/services/notes.service';

type NoteKind = 'Note' | 'Scorecard';

@Component({
  selector: 'app-application-notes',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './application-notes.html',
  styles: [`
    .notes-wrap { padding: 12px 4px; display: flex; flex-direction: column; gap: 12px; }
    .notes-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .notes-head .h { font-weight: 600; font-size: 16px; }
    .head-actions { display: flex; gap: 8px; }
    .form-card, .note-card { padding: 14px; }
    .row { display: flex; gap: 12px; flex-wrap: wrap; }
    .grow { width: 100%; }
    .score-field { width: 150px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .note-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .note-top .who { color: rgba(0,0,0,.6); font-size: 13px; }
    .body { white-space: pre-wrap; margin: 8px 0; }
    .scores { display: flex; gap: 16px; flex-wrap: wrap; color: rgba(0,0,0,.75); font-size: 13px; margin-top: 6px; }
    .scores b { font-weight: 600; }
    .busy { display: flex; justify-content: center; padding: 16px; }
    .empty { color: rgba(0,0,0,.55); padding: 12px 4px; }
    .kind-chip.scorecard { background: #ede7f6; }
    .kind-chip.note { background: #eceff1; }
    .rec { margin-top: 4px; }
    .rec-chip.strongyes, .rec-chip.yes { background: #e8f5e9; }
    .rec-chip.no, .rec-chip.strongno { background: #fdecea; }
    .rec-chip.neutral { background: #fff8e1; }
  `]
})
export class ApplicationNotesComponent implements OnChanges {
  @Input({ required: true }) applicationId!: string;

  loading = signal(false);
  saving = signal(false);
  notes = signal<any[]>([]);
  showForm = signal(false);
  kind = signal<NoteKind>('Note');

  recommendations = ['StrongYes', 'Yes', 'Neutral', 'No', 'StrongNo'];
  scores = [1, 2, 3, 4, 5];

  form: FormGroup;

  constructor(
    private api: NotesService,
    private fb: FormBuilder,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      body: ['', Validators.required],
      technicalScore: [null as number | null],
      communicationScore: [null as number | null],
      cultureFitScore: [null as number | null],
      recommendation: [null as string | null]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['applicationId'] && this.applicationId) this.load();
  }

  load() {
    if (!this.applicationId) return;
    this.loading.set(true);
    this.api.getByApplication(this.applicationId).subscribe({
      next: (res) => { this.notes.set(res ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snack.open('Failed to load notes', 'Close', { duration: 3000 }); }
    });
  }

  private openForm(kind: NoteKind) {
    this.kind.set(kind);
    this.form.reset({ body: '', technicalScore: null, communicationScore: null, cultureFitScore: null, recommendation: null });
    this.showForm.set(true);
  }
  newNote() { this.openForm('Note'); }
  newScorecard() { this.openForm('Scorecard'); }
  cancelForm() { this.showForm.set(false); }

  submit() {
    if (this.form.invalid) { this.snack.open('Note text is required', 'Close', { duration: 2500 }); return; }
    const v = this.form.value;
    const payload: any = { jobApplicationId: this.applicationId, kind: this.kind(), body: v.body };
    if (this.kind() === 'Scorecard') {
      payload.technicalScore = v.technicalScore ?? null;
      payload.communicationScore = v.communicationScore ?? null;
      payload.cultureFitScore = v.cultureFitScore ?? null;
      payload.recommendation = v.recommendation ?? null;
    }

    this.saving.set(true);
    this.api.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.snack.open(this.kind() === 'Scorecard' ? 'Scorecard added' : 'Note added', 'Close', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(typeof err?.error === 'string' ? err.error : 'Save failed', 'Close', { duration: 3500 });
      }
    });
  }

  remove(n: any) {
    if (!confirm('Delete this entry?')) return;
    this.api.delete(n.id).subscribe({
      next: () => { this.snack.open('Deleted', 'Close', { duration: 2000 }); this.load(); },
      error: (err) => { this.snack.open(typeof err?.error === 'string' ? err.error : 'Delete failed (only the author or an admin can delete)', 'Close', { duration: 3500 }); }
    });
  }

  avg(n: any): string | null {
    const vals = [n.technicalScore, n.communicationScore, n.cultureFitScore].filter((x) => x != null);
    if (!vals.length) return null;
    return (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(1);
  }

  kindChip(kind: string) { return 'kind-chip ' + (kind || '').toLowerCase(); }
  recChip(rec: string) { return 'rec-chip ' + (rec || '').toLowerCase(); }
  recLabel(rec: string) {
    switch (rec) {
      case 'StrongYes': return 'Strong Yes';
      case 'StrongNo': return 'Strong No';
      default: return rec;
    }
  }
}
