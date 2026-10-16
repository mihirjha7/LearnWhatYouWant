import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { Course } from '../../models/course.model';
import { DurationFormatPipe} from '../shared/pipes/duration-format-pipe';
// --- MATERIAL IMPORTS ---
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip'; // <-- ADD THIS

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule, // <-- AND ADD IT HERE
    DurationFormatPipe
  ],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css']
})
export class CourseCardComponent {
  @Input() course!: Course;

  starsArray = [1, 2, 3, 4, 5];

  // No router or isHovered needed
  constructor() {} 


  getRoundedRating(): number {
    return Math.round(this.course.rating ?? 0);
  }

  getFormattedRating(): string {
    return this.course.rating ? this.course.rating.toFixed(1) : '—';
  }
}