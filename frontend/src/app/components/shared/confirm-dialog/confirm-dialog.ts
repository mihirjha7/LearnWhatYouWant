// src/app/components/shared/confirm-dialog/confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.css'], // <-- Add the CSS file
})
export class ConfirmDialogComponent {
  titleIcon: string = 'help_outline';
  // Default to accent (Orange) for the main action
  actionColor: 'primary' | 'accent' | 'warn' = 'accent';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    const titleLower = data.title.toLowerCase();

    // Check for destructive action keywords
    if (titleLower.includes('delete') || titleLower.includes('remove') || titleLower.includes('unpublish')) {
      this.titleIcon = 'delete_outline';
      this.actionColor = 'warn'; // Use Red
    } 
    // Check for "positive" action keywords
    else if (titleLower.includes('publish') || titleLower.includes('confirm')) {
      this.titleIcon = 'publish';
      this.actionColor = 'primary'; // Use Cyan
    }
    // All other cases will use the 'help_outline' and 'accent' (Orange) defaults
  }
}