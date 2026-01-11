import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss'
})
export class UserDialogComponent {
  loading = signal(false);

  mode: 'create' | 'edit';
  user?: any;

  roles = ['Admin', 'Recruiter', 'HiringManager'];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: UsersService,
    private snack: MatSnackBar,
    private ref: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Recruiter', [Validators.required]],
      isActive: [true, [Validators.required]],
      password: ['']
    });

    this.mode = data?.mode ?? 'create';
    this.user = data?.user;

    if (this.mode === 'create') {
      this.form.controls['password'].addValidators([Validators.required, Validators.minLength(6)]);
this.form.controls['password'].updateValueAndValidity();
    }

    if (this.mode === 'edit' && this.user) {
      this.form.patchValue({
        fullName: this.user.fullName ?? '',
        email: this.user.email ?? '',
        role: this.user.role ?? 'Recruiter',
        isActive: !!this.user.isActive
      });
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const v = this.form.getRawValue();

    if (this.mode === 'create') {
      const payload = {
        fullName: v.fullName,
        email: v.email,
        role: v.role,
        isActive: v.isActive,
        password: v.password
      };

      this.api.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('User created', 'Close', { duration: 2500 });
          this.ref.close('refresh');
        },
        error: (err) => {
          this.loading.set(false);
          const msg = typeof err?.error === 'string' ? err.error : 'Create failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    } else {
      const payload = {
        fullName: v.fullName,
        email: v.email,
        role: v.role,
        isActive: v.isActive
      };

      this.api.update(this.user.id, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('User updated', 'Close', { duration: 2500 });
          this.ref.close('refresh');
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
    this.ref.close();
  }
}