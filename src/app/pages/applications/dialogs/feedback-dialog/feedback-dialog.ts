import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './feedback-dialog.html',
  styleUrls: ['./feedback-dialog.scss']
})
export class FeedbackDialogComponent {
  decisions = ['StrongHire', 'Hire', 'LeanHire', 'NoHire', 'StrongNoHire'];

  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  ngOnInit() {
    this.form = this.fb.group({
      decision: ['Hire', [Validators.required]],
      rating: [4, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: [''],
      isSubmitted: [true]
    });
  }

  save() {
    const v = this.form.getRawValue();
    this.ref.close(v);
  }

  close() {
    this.ref.close(null);
  }
}
