import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import {
  CatalogCourseSummary,
  CatalogQuery,
  CourseLevel,
} from '../../../data-access/contracts/catalog.models';
import { CatalogFacade } from '../catalog.facade';
import { CatalogCourseCardComponent } from '../course-card/catalog-course-card';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CatalogCourseCardComponent],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
})
export class CatalogPageComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  protected readonly filterForm = inject(FormBuilder).nonNullable.group({
    query: '',
    category: '',
    level: '' as CourseLevel | '',
    language: '',
    sort: 'relevance' as NonNullable<CatalogQuery['sort']>,
  });
  protected readonly courses = signal<readonly CatalogCourseSummary[]>([]);
  protected readonly categories = signal<readonly string[]>([
    'Business',
    'Data',
    'Design & UX',
    'Development',
    'Leadership',
    'Security',
  ]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly viewMode = signal<'grid' | 'list'>('grid');
  private readonly catalog = inject(CatalogFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((parameters) => {
      this.page.set(Math.max(1, Number(parameters.get('page')) || 1));
      this.filterForm.patchValue(
        {
          query: parameters.get('q') ?? '',
          category: parameters.get('category') ?? '',
          level: this.readLevel(parameters.get('level')),
          language: parameters.get('language') ?? '',
          sort: this.readSort(parameters.get('sort')),
        },
        { emitEvent: false },
      );
      this.loadCourses();
    });

    this.filterForm.valueChanges
      .pipe(
        debounceTime(180),
        map((value) => JSON.stringify(value)),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncFiltersToUrl());
  }

  ngAfterViewInit(): void {
    if (this.route.snapshot.queryParamMap.get('focus') === 'search') {
      this.searchInput?.nativeElement.focus();
    }
  }

  protected setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  protected clearFilters(): void {
    this.filterForm.reset({ query: '', category: '', level: '', language: '', sort: 'relevance' });
  }

  protected activeFilterCount(): number {
    const value = this.filterForm.getRawValue();
    return [value.category, value.level, value.language].filter(Boolean).length;
  }

  protected previousPage(): void {
    if (this.page() > 1) this.updatePage(this.page() - 1);
  }

  protected nextPage(): void {
    if (this.page() < this.totalPages()) this.updatePage(this.page() + 1);
  }

  private loadCourses(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const filters = this.filterForm.getRawValue();
    this.catalog
      .listCourses({
        query: filters.query,
        category: filters.category,
        level: filters.level,
        language: filters.language,
        sort: filters.sort,
        page: this.page(),
        pageSize: 9,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.courses.set(response.items);
          this.totalItems.set(response.totalItems);
          this.totalPages.set(response.totalPages);
          this.categories.set(
            [...new Set([...this.categories(), ...response.items.map((course) => course.category)])].sort(),
          );
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('The catalog could not be loaded. Your filters are preserved.');
          this.isLoading.set(false);
        },
      });
  }

  private syncFiltersToUrl(): void {
    const value = this.filterForm.getRawValue();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: value.query.trim() || null,
        category: value.category || null,
        level: value.level || null,
        language: value.language || null,
        sort: value.sort === 'relevance' ? null : value.sort,
        page: null,
        focus: null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private updatePage(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  private readLevel(value: string | null): CourseLevel | '' {
    return value === 'Beginner' || value === 'Intermediate' || value === 'Advanced' ? value : '';
  }

  private readSort(value: string | null): NonNullable<CatalogQuery['sort']> {
    return value === 'rating' || value === 'newest' || value === 'duration' ? value : 'relevance';
  }
}
