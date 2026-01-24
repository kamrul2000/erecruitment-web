import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { TenantThemeService } from '../../../../core/services/tenant-theme.service';

@Component({
  selector: 'app-branding-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './branding-settings.html',
  styleUrl: './branding-settings.scss'
})
export class BrandingSettingsComponent {
  loading = signal(false);
  saving = signal(false);

  theme = signal<any | null>(null);

  templates = ['Default', 'Modern', 'Minimal'];
  fonts = ['Inter', 'Roboto', 'Poppins', 'Arial'];

  form!: ReturnType<FormBuilder['group']>;

  preview = computed(() => {
    const v = this.form.getRawValue();
    return {
      companyName: v.companyName || 'Company',
      template: v.template || 'Default',
      fontFamily: v.fontFamily || 'Inter',
      primaryColor: v.primaryColor || '#1976d2',
      secondaryColor: v.secondaryColor || '#9c27b0',
      backgroundColor: v.backgroundColor || '#ffffff',
      logoUrl: v.logoUrl || null
    };
  });

  constructor(
    private fb: FormBuilder,
    private api: TenantThemeService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      template: ['Default', [Validators.required]],
      fontFamily: ['Inter', [Validators.required]],

      primaryColor: ['#1976d2', [Validators.required]],
      secondaryColor: ['#9c27b0', [Validators.required]],
      backgroundColor: ['#ffffff', [Validators.required]],

      logoUrl: [''],
      faviconUrl: [''],
      customCss: ['']
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getTheme().subscribe({
      next: (res) => {
        this.theme.set(res);
        this.form.patchValue({
          companyName: res.companyName ?? '',
          template: res.template ?? 'Default',
          fontFamily: res.fontFamily ?? 'Inter',
          primaryColor: res.primaryColor ?? '#1976d2',
          secondaryColor: res.secondaryColor ?? '#9c27b0',
          backgroundColor: res.backgroundColor ?? '#ffffff',
          logoUrl: res.logoUrl ?? '',
          faviconUrl: res.faviconUrl ?? '',
          customCss: res.customCss ?? ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Failed to load theme';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const v = this.form.getRawValue();

    const payload = {
      companyName: (v.companyName || '').trim(),
      template: v.template,
      fontFamily: v.fontFamily,

      primaryColor: v.primaryColor,
      secondaryColor: v.secondaryColor,
      backgroundColor: v.backgroundColor,

      logoUrl: (v.logoUrl || '').trim() || null,
      faviconUrl: (v.faviconUrl || '').trim() || null,
      customCss: (v.customCss || '').trim() || null
    };

    this.api.updateTheme(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.snack.open('Theme saved', 'Close', { duration: 2500 });

        // keep in sync if backend returns saved object
        if (res) this.theme.set(res);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Save failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  onLogoSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.api.uploadLogo(file).subscribe({
      next: (res) => {
        // assume backend returns { logoUrl: "..." }
        if (res?.logoUrl) this.form.patchValue({ logoUrl: res.logoUrl });
        this.snack.open('Logo uploaded', 'Close', { duration: 2500 });
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err.error : 'Upload failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  resetDefaults() {
    this.form.patchValue({
      template: 'Default',
      fontFamily: 'Inter',
      primaryColor: '#1976d2',
      secondaryColor: '#9c27b0',
      backgroundColor: '#ffffff',
      customCss: ''
    });
  }
}
