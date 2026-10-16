import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryCard } from '../../models/student.model';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './widget.html',
  styleUrl: './widget.css'
})
export class WidgetComponent {
  @Input({ required: true }) cardData!: SummaryCard;
}