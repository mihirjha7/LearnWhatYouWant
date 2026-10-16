import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CatalogCourseSummary,
  LearningPathSummary,
} from '../../data-access/contracts/catalog.models';
import { CatalogFacade } from '../../features/catalog/catalog.facade';
import { CatalogCourseCardComponent } from '../../features/catalog/course-card/catalog-course-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CatalogCourseCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly courses = signal<readonly CatalogCourseSummary[]>([]);
  protected readonly learningPaths = signal<readonly LearningPathSummary[]>([]);
  protected readonly categories = signal<readonly string[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly catalog = inject(CatalogFacade);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    forkJoin({
      courses: this.catalog.listCourses({ pageSize: 6 }),
      paths: this.catalog.listLearningPaths(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ courses, paths }) => {
          this.courses.set(courses.items);
          this.learningPaths.set(paths);
          this.categories.set([...new Set(courses.items.map((course) => course.category))]);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('We could not load the catalog. Please retry in a moment.');
          this.isLoading.set(false);
        },
      });
  }

  protected submitSearch(): void {
    const query = this.search.value.trim();
    void this.router.navigate(['/catalog'], { queryParams: query ? { q: query } : {} });
  }
}
