import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Reset Password</h2>

    <mat-dialog-content [formGroup]="form">
      <div style="margin-bottom:10px;">
        <div style="font-weight:700;">{{ data.user?.fullName }}</div>
        <div style="font-size:12px; opacity:.7;">{{ data.user?.email }}</div>
      </div>

      <mat-form-field appearance="outline" style="width:100%;">
        <mat-label>New Password</mat-label>
        <input matInput type="password" formControlName="newPassword" />
        <mat-error *ngIf="form.controls['newPassword'].touched && form.controls['newPassword'].invalid">
          Minimum 6 characters
        </mat-error>
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">Reset</button>
    </mat-dialog-actions>
  `
})
export class ResetPasswordDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  save() {
    this.ref.close(this.form.getRawValue().newPassword);
  }

  close() {
    this.ref.close(null);
  }
}
