import { Component, Input, signal, computed ,OnChanges, SimpleChanges} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { InterviewsService } from '../../../core/services/interviews.service';
import { UsersService } from '../../../core/services/users.service';

import { CreateRoundDialogComponent } from '../dialogs/create-round-dialog/create-round-dialog';
import { ScheduleInterviewDialogComponent } from '../dialogs/schedule-interview-dialog/schedule-interview-dialog';
import { FeedbackDialogComponent } from '../dialogs/feedback-dialog/feedback-dialog';

@Component({
  selector: 'app-application-interviews',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './application-interviews.html',
  styleUrls: ['./application-interviews.scss']
})
export class ApplicationInterviewsComponent implements OnChanges{
  @Input({ required: true }) applicationId!: string;

  loading = signal(false);

  rounds = signal<any[]>([]);
  interviews = signal<any[]>([]);
  participants = signal<any[]>([]);
  feedbacks = signal<any[]>([]);

  users = signal<any[]>([]); // for interviewer selection (from Users API)

  roundsWithInterviews = computed(() => {
    const r = this.rounds();
    const ints = this.interviews();
    const parts = this.participants();
    const fbs = this.feedbacks();

    // group participants + feedback by interviewId
    const partMap = new Map<string, any[]>();
    for (const p of parts) {
      const k = String(p.interviewId);
      partMap.set(k, [...(partMap.get(k) ?? []), p]);
    }

    const fbMap = new Map<string, any[]>();
    for (const fb of fbs) {
      const k = String(fb.interviewId);
      fbMap.set(k, [...(fbMap.get(k) ?? []), fb]);
    }

    // attach
    const interviewsByRound = new Map<string, any[]>();
    for (const i of ints) {
      const k = String(i.interviewRoundId);
      i._participants = partMap.get(String(i.id)) ?? [];
      i._feedbacks = fbMap.get(String(i.id)) ?? [];
      interviewsByRound.set(k, [...(interviewsByRound.get(k) ?? []), i]);
    }

    return r.map(round => ({
      ...round,
      _interviews: interviewsByRound.get(String(round.id)) ?? []
    }));
  });

  constructor(
    private api: InterviewsService,
    private usersApi: UsersService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }
 ngOnChanges(changes: SimpleChanges) {
    if (changes['applicationId'] && this.applicationId) {
      this.loadUsers();
      this.load();
    }
  }
  loadUsers() {
    // If you have a different users endpoint, update UsersService.getAll()
    this.usersApi.getAll().subscribe({
      next: (res: any[]) => this.users.set(res ?? []),
      error: () => this.users.set([])
    });
  }

 load() {
  if (!this.applicationId) return;

  this.loading.set(true);
  this.api.getByApplication(this.applicationId).subscribe({
    next: (res) => {
  const interviews = (res?.interviews ?? []).map((i: any) => ({
    ...i,
    interviewId: i.interviewId ?? i.id   // normalize
  }));

  this.rounds.set(res?.rounds ?? []);
  this.interviews.set(interviews);
  this.participants.set(res?.participants ?? []);
  this.feedbacks.set(res?.feedbacks ?? []);
  this.loading.set(false);
},
    error: (err) => {
      this.loading.set(false);
      const msg = typeof err?.error === 'string'
        ? err.error
        : 'Failed to load interviews';
      this.snack.open(msg, 'Close', { duration: 3500 });
    }
  });
}


  openCreateRound() {
      console.log('Add round clicked, applicationId =', this.applicationId);

    const ref = this.dialog.open(CreateRoundDialogComponent, {
      width: '520px',
      data: { applicationId: this.applicationId, existing: this.rounds() }
    });

    ref.afterClosed().subscribe((payload: any) => {
      if (!payload) return;

      this.api.createRound(payload).subscribe({
        next: () => {
          this.snack.open('Round created', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Create round failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  openSchedule(round: any) {
    const ref = this.dialog.open(ScheduleInterviewDialogComponent, {
      width: '760px',
      data: {
        applicationId: this.applicationId,
        round,
        users: this.users()
      }
    });

    ref.afterClosed().subscribe((payload: any) => {
      if (!payload) return;

      this.api.schedule(payload).subscribe({
        next: () => {
          this.snack.open('Interview scheduled', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Schedule failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  cancel(interview: any) {
    const ok = confirm('Cancel this interview?');
    if (!ok) return;

    this.api.cancel(interview.id).subscribe({
      next: () => {
        this.snack.open('Interview cancelled', 'Close', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Cancel failed', 'Close', { duration: 3000 })
    });
  }

  complete(interview: any) {
    const ok = confirm('Mark interview as Completed?');
    if (!ok) return;

    this.api.complete(interview.id).subscribe({
      next: () => {
        this.snack.open('Interview completed', 'Close', { duration: 2500 });
        this.load();
      },
      error: () => this.snack.open('Complete failed', 'Close', { duration: 3000 })
    });
  }

  openFeedback(interview: any) {
    const ref = this.dialog.open(FeedbackDialogComponent, {
      width: '620px',
      data: { interview }
    });

    ref.afterClosed().subscribe((payload: any) => {
      if (!payload) return;

      this.api.submitFeedback(interview.interviewId, payload).subscribe({
        next: () => {
          this.snack.open('Feedback saved', 'Close', { duration: 2500 });
          this.load();
        },
        error: (err) => {
          const msg = typeof err?.error === 'string' ? err.error : 'Feedback failed';
          this.snack.open(msg, 'Close', { duration: 3500 });
        }
      });
    });
  }

  userName(userId: string) {
    const u = this.users().find(x => String(x.id) === String(userId));
    return u ? (u.fullName || u.email) : userId;
  }

  chipStatus(status: string) {
    const s = (status || '').toLowerCase();
    if (s === 'scheduled') return 'chip scheduled';
    if (s === 'completed') return 'chip completed';
    if (s === 'cancelled') return 'chip cancelled';
    if (s === 'noshow') return 'chip noshow';
    return 'chip';
  }
}
