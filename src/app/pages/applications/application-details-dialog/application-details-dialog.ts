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
    ApplicationInterviewsComponent
  ],
  templateUrl: './application-details-dialog.html',
  styleUrls: ['./application-details-dialog.scss']
})
export class ApplicationDetailsDialogComponent {
  app!: ReturnType<typeof signal<any>>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: MatDialogRef<ApplicationDetailsDialogComponent>
  ) {}

  ngOnInit() {
    this.app = signal<any>(this.data.application);
  }

  close(changed = false) {
    this.ref.close(changed);
  }

  openResume() {
    const a = this.app();
    const url = a.resumeUrlSnapshot || a.resumeUrl;
    if (!url) return;
    window.open(url, '_blank');
  }
}
