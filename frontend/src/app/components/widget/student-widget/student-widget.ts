// src/app/shared/student-widget/student-widget.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SummaryCard } from '../../../models/student.model';

@Component({
  selector: 'app-student-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './student-widget.html',
  styleUrl: './student-widget.css',
})
export class StudentWidgetComponent {
  /**
   * Input property for the card data.
   * Uses the SummaryCard interface defined previously.
   */
  @Input() cardData!: SummaryCard;

  constructor() {}
}