import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-template-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatChipsModule
  ],
  templateUrl: './template-dialog.html',
  styleUrls : ['./template-dialog.scss']
})
export class TemplateDialogComponent {
  form;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<TemplateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.form = this.fb.group({
      templateType: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      body: ['', [Validators.required]],
      isEnabled: [true, [Validators.required]]
    });
    const t = data?.template ?? {};
    this.form.patchValue({
      templateType: t.templateType ?? '',
      subject: t.subject ?? '',
      body: t.body ?? '',
      isEnabled: !!t.isEnabled
    });
  }

  save() {
    this.ref.close(this.form.getRawValue());
  }

  close() {
    this.ref.close(null);
  }
}
