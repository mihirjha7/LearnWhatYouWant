import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="app-card-title">{{ data.title }}</h2>
    <div mat-dialog-content>
      <p>{{ data.message }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-stroked-button (click)="ref.close(false)">{{ data.cancelText || 'Cancel' }}</button>
      <button mat-flat-button color="warn" (click)="ref.close(true)">
        <mat-icon>delete</mat-icon> {{ data.confirmText || 'Delete' }}
      </button>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; confirmText?: string; cancelText?: string; },
    public ref: MatDialogRef<ConfirmDialogComponent>
  ) {}
}
