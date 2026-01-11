import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-history-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatChipsModule],
  templateUrl:'./history-dialog.html',
  styleUrls: ['./history-dialog.scss']
})
export class HistoryDialogComponent {
  cols = ['from', 'to', 'note', 'when'];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
