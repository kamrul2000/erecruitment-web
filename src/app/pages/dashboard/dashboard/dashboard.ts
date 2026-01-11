import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card style="border-radius: 16px; padding: 16px;">
      <h2 style="margin:0 0 6px 0;">Welcome</h2>
      <p style="margin:0; opacity: .75;">
        Next we will add Candidates, Jobs and Applications pages with tables, dialogs and filters.
      </p>
    </mat-card>
  `
})
export class Dashboard {}
