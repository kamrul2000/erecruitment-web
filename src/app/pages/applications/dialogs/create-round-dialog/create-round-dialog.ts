import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-round-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
 templateUrl: './create-round-dialog.html',
  styleUrls: ['./create-round-dialog.scss']})
export class CreateRoundDialogComponent {
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<CreateRoundDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name: ['Round', [Validators.required]],
      sortOrder: [1, [Validators.required, Validators.min(1)]]
    });
    const existing = data?.existing ?? [];
    const nextOrder = existing.length ? Math.max(...existing.map((x: any) => x.sortOrder || 0)) + 1 : 1;
    this.form.patchValue({ sortOrder: nextOrder });
  }

  save() {
    const v = this.form.getRawValue();
    this.ref.close({
      jobApplicationId: this.data.applicationId,
      name: (v.name || 'Round').trim(),
      sortOrder: v.sortOrder ?? 1
    });
  }

  close() {
    this.ref.close(null);
  }
}
