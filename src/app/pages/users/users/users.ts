import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { UsersService } from '../../../core/services/users.service';
import { UserDialogComponent } from './../user-dialog/user-dialog';
import { ResetPasswordDialogComponent } from './../reset-password-dialog/reset-password-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class UsersComponent {
  loading = signal(false);
  search = signal('');
  users = signal<any[]>([]);

  displayedColumns = ['fullName', 'email', 'role', 'status', 'createdAt', 'actions'];

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.users();

    return this.users().filter(u =>
      (u.fullName ?? '').toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q)
    );
  });

  constructor(
    private api: UsersService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getAll().subscribe({
      next: (res) => {
        this.users.set(res ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Failed to load users';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '640px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'refresh') this.load();
    });
  }

  openEdit(user: any) {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '640px',
      data: { mode: 'edit', user }
    });

    ref.afterClosed().subscribe(r => {
      if (r === 'refresh') this.load();
    });
  }

  resetPassword(user: any) {
    const ref = this.dialog.open(ResetPasswordDialogComponent, {
      width: '520px',
      data: { user }
    });

    ref.afterClosed().subscribe((newPassword: string | null) => {
      if (!newPassword) return;

      this.api.resetPassword(user.id, newPassword).subscribe({
        next: () => this.snack.open('Password reset successful', 'Close', { duration: 2500 }),
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Reset failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  toggleActive(user: any) {
    const ok = confirm(`${user.isActive ? 'Disable' : 'Enable'} user: ${user.fullName}?`);
    if (!ok) return;

    this.api.toggleActive(user.id).subscribe({
      next: () => {
        this.snack.open('Updated', 'Close', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err.error : 'Update failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  roleClass(role: string) {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return 'admin';
    if (r === 'hiringmanager') return 'manager';
    return 'recruiter';
  }

  statusClass(active: boolean) {
    return active ? 'active' : 'inactive';
  }
}
