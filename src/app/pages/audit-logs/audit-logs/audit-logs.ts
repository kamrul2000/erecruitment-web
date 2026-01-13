import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { AuditLogsService } from '../../../core/services/audit-logs.service';
import { AuditDetailsDialogComponent } from './../audit-details-dialog/audit-details-dialog';

@Component({
  selector: 'app-audit-logs',
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
    MatPaginatorModule,
    MatSelectModule
  ],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.scss'
})
export class AuditLogsComponent {
  loading = signal(false);

  page = signal(1);
  pageSize = signal(20);
  total = signal(0);
  items = signal<any[]>([]);

  displayedColumns = ['createdAt', 'action', 'entity', 'actor', 'summary', 'ip', 'actions'];

  entityTypes = ['', 'JobPosting', 'JobApplication', 'Candidate', 'AppUser', 'TenantSettings', 'EmailTemplate'];

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private api: AuditLogsService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      from: [''],
      to: [''],
      action: [''],
      entityType: [''],
      entityId: [''],
      keyword: ['']
    });
    this.search();
  }

  search(resetPage = false) {
    if (resetPage) this.page.set(1);

    this.loading.set(true);

    const v = this.form.getRawValue();
    const query = {
      ...v,
      page: this.page(),
      pageSize: this.pageSize()
    };

    this.api.search(query).subscribe({
      next: (res) => {
        this.total.set(res?.total ?? 0);
        this.items.set(res?.items ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = typeof err?.error === 'string' ? err.error : 'Failed to load audit logs';
        this.snack.open(msg, 'Close', { duration: 3500 });
      }
    });
  }

  reset() {
    this.form.reset({ from: '', to: '', action: '', entityType: '', entityId: '', keyword: '' });
    this.page.set(1);
    this.search();
  }

  onPage(e: PageEvent) {
    this.page.set(e.pageIndex + 1);
    this.pageSize.set(e.pageSize);
    this.search();
  }

  openDetails(row: any) {
    this.api.getById(row.id).subscribe({
      next: (detail) => {
        this.dialog.open(AuditDetailsDialogComponent, {
          width: '860px',
          data: detail
        });
      },
      error: () => this.snack.open('Failed to load details', 'Close', { duration: 3000 })
    });
  }
}
