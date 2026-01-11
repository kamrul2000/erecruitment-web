import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CandidatesService } from '../../../core/services/candidates.service';
import { Candidate } from '../../../core/models/api-models';
import { AfterViewInit } from '@angular/core';


@Component({
  selector: 'app-candidate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './candidate-dialog.html',
  styleUrl: './candidate-dialog.scss'
})
export class CandidateDialogComponent  {
  
  loading = signal(false);

  mode: 'create' | 'edit';
  candidate?: Candidate;

  form:FormGroup;

  currencies = ['BDT', 'USD', 'EUR', 'INR'];

  constructor(
    private fb: FormBuilder,
    private api: CandidatesService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<CandidateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) 
  
    {
    // Initialize the form inside the constructor
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      addressLine: ['', [Validators.required]],

      previousCompanyName: [''],
      noOfYearExperience: [null as number | null],

      instituteName: ['', [Validators.required]],
      subject: ['', [Validators.required]],

      expectedSalary: [null as number | null],
      salaryCurrency: ['BDT', [Validators.required]]
    });
    this.mode = data?.mode ?? 'create';
    this.candidate = data?.candidate;

    if (this.mode === 'edit' && this.candidate) {
      this.form.patchValue({
        fullName: this.candidate.fullName ?? '',
        email: this.candidate.email ?? '',
        phone: (this.candidate as any).phone ?? '',
        addressLine: (this.candidate as any).addressLine ?? '',
        previousCompanyName: (this.candidate as any).previousCompanyName ?? '',
        noOfYearExperience: (this.candidate as any).noOfYearExperience ?? null,
        instituteName: (this.candidate as any).instituteName ?? '',
        subject: (this.candidate as any).subject ?? '',
        expectedSalary: (this.candidate as any).expectedSalary ?? null,
        salaryCurrency: (this.candidate as any).salaryCurrency ?? 'BDT',
      });
    }
  }
  

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const payload = this.form.getRawValue();

    if (this.mode === 'create') {
      this.api.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('Candidate created', 'Close', { duration: 2500 });
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.loading.set(false);
          const msg = typeof err?.error === 'string' ? err.error : 'Create failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    } else {
      const id = this.candidate!.id;
      this.api.update(id, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.snack.open('Candidate updated', 'Close', { duration: 2500 });
          this.dialogRef.close('refresh');
        },
        error: (err) => {
          this.loading.set(false);
          const msg = typeof err?.error === 'string' ? err.error : 'Update failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
