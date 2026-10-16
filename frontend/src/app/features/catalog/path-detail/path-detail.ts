import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CatalogCourseSummary, LearningPathSummary } from '../../../data-access/contracts/catalog.models';
import { CatalogFacade } from '../catalog.facade';

@Component({
  selector: 'app-path-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './path-detail.html',
  styleUrl: './path-detail.css',
})
export class PathDetailComponent implements OnInit {
  protected readonly path = signal<LearningPathSummary | null>(null);
  protected readonly courses = signal<readonly CatalogCourseSummary[]>([]);
  protected readonly isLoading = signal(true);
  private readonly catalog = inject(CatalogFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const pathId = this.route.snapshot.paramMap.get('pathId');
    if (!pathId) {
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      path: this.catalog.getLearningPath(pathId),
      courses: this.catalog.listCourses({ pageSize: 100 }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ path, courses }) => {
          this.path.set(path);
          this.courses.set(path ? path.courseIds.map((id) => courses.items.find((course) => course.id === id)).filter((course): course is CatalogCourseSummary => !!course) : []);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  protected durationLabel(minutes: number): string {
    return `${Math.round(minutes / 60)} hours`;
  }
}
