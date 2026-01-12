import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { SettingsService } from '../../../core/services/settings.service';
import { StageDialogComponent } from './../stage-dialog/stage-dialog';
import { TemplateDialogComponent } from './../template-dialog/template-dialog';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent {
  loading = signal(false);

  settings = signal<any>(null);
  stages = signal<any[]>([]);
  templates = signal<any[]>([]);

  brandingForm;
  limitsForm;

  stageColumns = ['name', 'key', 'sortOrder', 'terminal', 'status', 'actions'];
  templateColumns = ['type', 'enabled', 'subject', 'actions'];

  constructor(
    private fb: FormBuilder,
    private api: SettingsService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.brandingForm = this.fb.group({
      companyName: ['', [Validators.required]],
      logoUrl: [''],
      primaryColor: ['#3f51b5', [Validators.required]],
      careerPageEnabled: [true, [Validators.required]],
      timeZone: ['Asia/Dhaka', [Validators.required]]
    });

    this.limitsForm = this.fb.group({
      maxResumeSizeMb: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      allowedResumeTypes: ['pdf,doc,docx', [Validators.required]]
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);

    this.api.get().subscribe({
      next: (res) => {
        this.loading.set(false);

        this.settings.set(res?.settings ?? null);
        this.stages.set(res?.pipelineStages ?? []);
        this.templates.set(res?.emailTemplates ?? []);

        const s = res?.settings;
        if (s) {
          this.brandingForm.patchValue({
            companyName: s.companyName ?? '',
            logoUrl: s.logoUrl ?? '',
            primaryColor: s.primaryColor ?? '#3f51b5',
            careerPageEnabled: !!s.careerPageEnabled,
            timeZone: s.timeZone ?? 'Asia/Dhaka'
          });

          this.limitsForm.patchValue({
            maxResumeSizeMb: s.maxResumeSizeMb ?? 10,
            allowedResumeTypes: s.allowedResumeTypes ?? 'pdf,doc,docx'
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Failed to load settings';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  saveBranding() {
    if (this.brandingForm.invalid) {
      this.brandingForm.markAllAsTouched();
      return;
    }
    this.saveAll();
  }

  saveLimits() {
    if (this.limitsForm.invalid) {
      this.limitsForm.markAllAsTouched();
      return;
    }
    this.saveAll();
  }

  private saveAll() {
    const payload = {
      ...(this.brandingForm.getRawValue()),
      ...(this.limitsForm.getRawValue())
    };

    this.loading.set(true);
    this.api.update(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.snack.open('Settings saved', 'Close', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Save failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  // Pipeline stages
  openCreateStage() {
    const ref = this.dialog.open(StageDialogComponent, {
      width: '620px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (!result) return;

      this.api.createStage(result).subscribe({
        next: () => {
          this.snack.open('Stage created', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Create failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  openEditStage(stage: any) {
    const ref = this.dialog.open(StageDialogComponent, {
      width: '620px',
      data: { mode: 'edit', stage }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (!result) return;

      this.api.updateStage(stage.id, result).subscribe({
        next: () => {
          this.snack.open('Stage updated', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Update failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  toggleStage(stage: any) {
    const ok = confirm(`${stage.isActive ? 'Disable' : 'Enable'} stage: ${stage.name}?`);
    if (!ok) return;

    this.api.toggleStage(stage.id).subscribe({
      next: () => {
        this.snack.open('Updated', 'Close', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Update failed', 'Close', { duration: 3000 })
    });
  }

  // Email templates
  openTemplate(template: any) {
    const ref = this.dialog.open(TemplateDialogComponent, {
      width: '820px',
      data: { template }
    });

    ref.afterClosed().subscribe((result: any) => {
      if (!result) return;

      this.api.upsertTemplate(result).subscribe({
        next: () => {
          this.snack.open('Template saved', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Save failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  stageStatusClass(active: boolean) {
    return active ? 'active' : 'inactive';
  }
}
