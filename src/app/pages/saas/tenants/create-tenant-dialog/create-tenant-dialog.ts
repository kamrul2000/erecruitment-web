import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: 'app-create-tenant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
],
  templateUrl: './create-tenant-dialog.html',
  styleUrl: './create-tenant-dialog.scss'
})
export class CreateTenantDialogComponent {

  saving = false;
  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<CreateTenantDialogComponent>
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      plan: ['Free', [Validators.required]],
  billingEmail: [''],
      adminFullName: ['', [Validators.required, Validators.minLength(2)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    this.ref.close({
      name: (v.name || '').trim(),
      slug: (v.slug || '').trim().toLowerCase(),
      plan: (v.plan || 'Free').trim(),
    billingEmail: (v.billingEmail || '').trim() || null,
      adminFullName: (v.adminFullName || '').trim(),
      adminEmail: (v.adminEmail || '').trim().toLowerCase(),
      adminPassword: v.adminPassword
    });
  }

  close() {
    this.ref.close(null);
  }

  autoSlug() {
    const name = (this.form.value.name || '').trim().toLowerCase();
    const slug = name
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    this.form.patchValue({ slug });
  }
}
