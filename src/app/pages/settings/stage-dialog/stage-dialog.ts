import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-stage-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: "./stage-dialog.html",
  styleUrls: ["./stage-dialog.scss"]
})
export class StageDialogComponent {
  mode: 'create' | 'edit';

  form;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<StageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      key: ['', [Validators.required]],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true, [Validators.required]],
      isTerminal: [false, [Validators.required]]
    });

    this.mode = data?.mode ?? 'create';

    if (this.mode === 'edit' && data?.stage) {
      const s = data.stage;
      this.form.patchValue({
        name: s.name,
        key: s.key,
        sortOrder: s.sortOrder,
        isActive: !!s.isActive,
        isTerminal: !!s.isTerminal
      });
    }
  }

  save() {
    const v = this.form.getRawValue();
    // normalize key
    v.key = (v.key || '').trim().toLowerCase();
    this.ref.close(v);
  }

  close() {
    this.ref.close(null);
  }
}
