import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-superadmin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './superadmin-login.html',
  styleUrls: ['./superadmin-login.scss']
})
export class SuperadminLoginComponent {
  hide = true;
  loading = false;

  form: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const v = this.form.getRawValue();

    this.auth.superAdminLogin({
      email: (v.email || '').trim().toLowerCase(),
      password: v.password || ''
    }).subscribe({
      next: () => {
        this.loading = false;
        // Token and user are already stored in AuthService
        this.router.navigateByUrl('/saas/tenants');
      },
      error: (err) => {
        this.loading = false;
        const msg = typeof err?.error === 'string' ? err.error : 'Login failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }
}
