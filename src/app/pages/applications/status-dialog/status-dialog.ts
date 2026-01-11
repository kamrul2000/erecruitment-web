import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators,FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './status-dialog.html',
  styleUrl: './status-dialog.scss'
})
export class StatusDialogComponent {
  statuses: string[] = [];
  current = '';

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<StatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.form = this.fb.group({
      status: ['', [Validators.required]],
      notes: ['']
    });

    this.statuses = data?.statuses ?? [];
    this.current = data?.current ?? '';

    // default to current or first
    this.form.patchValue({ status: this.current || this.statuses[0] || '' });
  }

  save() {
    this.ref.close(this.form.getRawValue());
  }

  close() {
    this.ref.close(null);
  }
}
