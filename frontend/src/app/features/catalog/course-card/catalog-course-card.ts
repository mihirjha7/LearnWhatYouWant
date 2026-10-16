import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogCourseSummary } from '../../../data-access/contracts/catalog.models';

@Component({
  selector: 'app-catalog-course-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './catalog-course-card.html',
  styleUrl: './catalog-course-card.css',
})
export class CatalogCourseCardComponent {
  @Input({ required: true }) course!: CatalogCourseSummary;

  protected durationLabel(): string {
    const hours = Math.floor(this.course.durationMinutes / 60);
    const minutes = this.course.durationMinutes % 60;
    return `${hours ? `${hours}h` : ''}${hours && minutes ? ' ' : ''}${minutes ? `${minutes}m` : ''}`;
  }
}
