import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { ApplicationInterviewsComponent } from '../application-interviews/application-interviews';
import { ApplicationOffersComponent } from '../application-offers/application-offers';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidatesService } from '../../../core/services/candidates.service';
import { openBlobInWindow } from '../../../core/utils/file-open';

@Component({
  selector: 'app-application-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    ApplicationInterviewsComponent,
    ApplicationOffersComponent
  ],
  templateUrl: './application-details-dialog.html',
  styleUrls: ['./application-details-dialog.scss']
})
export class ApplicationDetailsDialogComponent {
  [x: string]: any;
  app!: ReturnType<typeof signal<any>>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: MatDialogRef<ApplicationDetailsDialogComponent>,
    private candidatesApi: CandidatesService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.app = signal<any>(this.data.application);
  }

  close(changed = false) {
    this.ref.close(changed);
  }

  openResume() {
    const candidateId = this.app()?.candidateId;
    if (!candidateId) {
      this.snack.open('Resume not available', 'Close', { duration: 2500 });
      return;
    }
    // Open the tab synchronously (within the click) so popup blockers allow it,
    // then redirect it to the fetched CV blob from the protected endpoint.
    const win = window.open('', '_blank');
    this.candidatesApi.viewResume(candidateId).subscribe({
      next: (blob) => openBlobInWindow(blob, win),
      error: () => {
        win?.close();
        this.snack.open('Resume not available', 'Close', { duration: 2500 });
      }
    });
  }
}