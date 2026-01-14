import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-schedule-interview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './schedule-interview-dialog.html',
  styleUrls: ['./schedule-interview-dialog.scss']
})
export class ScheduleInterviewDialogComponent {
  modes = ['Online', 'Onsite', 'Phone'];

  form!: ReturnType<FormBuilder['group']>;

  round: any;
  users: any[];

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ScheduleInterviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.form = this.fb.group({
        startsAtLocal: ['', [Validators.required]], // input datetime-local
        durationMinutes: [60, [Validators.required, Validators.min(15), Validators.max(480)]],
        mode: ['Online', [Validators.required]],
        location: [''],
        meetingLink: [''],
        notes: [''],
        participantUserIds: [[] as string[]]
      });
    this.round = data?.round;
    this.users = data?.users ?? [];
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // Convert local datetime-local string -> Date -> ISO -> DateTimeOffset in UTC
    const local = new Date(v.startsAtLocal as any);
    const startsAtUtc = new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString();

    this.ref.close({
      jobApplicationId: this.data.applicationId,
      interviewRoundId: this.round.id,
      startsAtUtc,
      durationMinutes: v.durationMinutes,
      mode: v.mode,
      location: (v.location || '').trim() || null,
      meetingLink: (v.meetingLink || '').trim() || null,
      notes: (v.notes || '').trim() || null,
      participantUserIds: (v.participantUserIds || []).map((x: string) => x)
    });
  }

  close() {
    this.ref.close(null);
  }

  userLabel(u: any) {
    return `${u.fullName || u.email} (${u.role || 'User'})`;
  }
}
