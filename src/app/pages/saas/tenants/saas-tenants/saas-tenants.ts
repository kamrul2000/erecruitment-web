import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SaasTenantsService } from '../../../../core/services/saas-tenants.service';
import { CreateTenantDialogComponent } from '../create-tenant-dialog/create-tenant-dialog';

@Component({
  selector: 'app-saas-tenants',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './saas-tenants.html',
  styleUrl: './saas-tenants.scss'
})
export class SaasTenantsComponent {
  loading = signal(false);
  items = signal<any[]>([]);

displayedColumns = ['name', 'slug', 'plan', 'billing', 'status', 'stats', 'actions'];

  filterForm: ReturnType<FormBuilder['group']>;

  filtered = computed(() => {
    const k = (this.filterForm.value.keyword || '').trim().toLowerCase();
    if (!k) return this.items();

    return this.items().filter(t =>
      String(t.name || '').toLowerCase().includes(k) ||
      String(t.slug || '').toLowerCase().includes(k)
    );
  });

  constructor(
    private fb: FormBuilder,
    private api: SaasTenantsService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      keyword: ['']
    });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (res) => {
        this.items.set(res ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Failed to load tenants';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  openCreate() {
    const ref = this.dialog.open(CreateTenantDialogComponent, {
      width: '760px'
    });

    ref.afterClosed().subscribe((payload: any) => {
      if (!payload) return;

      this.api.createWithAdmin(payload).subscribe({
        next: () => {
          this.snack.open('Tenant created', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Create tenant failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  toggleActive(row: any) {
    const isActive = !!row.isActive;
    const ok = confirm(isActive ? 'Disable this tenant?' : 'Enable this tenant?');
    if (!ok) return;

    const call = isActive ? this.api.disable(row.id) : this.api.enable(row.id);

    call.subscribe({
      next: () => {
        this.snack.open(isActive ? 'Tenant disabled' : 'Tenant enabled', 'Close', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        const msg = typeof err?.error === 'string' ? err.error : 'Operation failed';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  statusClass(isActive: boolean) {
    return isActive ? 'chip active' : 'chip disabled';
  }
}
