import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { CredentialVerification, LearningActivityGateway } from '../../../data-access/contracts/learning-activity.contracts';
import { SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-credential-verify',
  standalone: true,
  imports: [DatePipe, RouterLink, SkeletonComponent, StatusBadgeComponent],
  template: `
    <section class="container page-section ws-page" style="max-width: 48rem">
      <header class="ws-header"><div><p class="ws-eyebrow">Credential verification</p><h1>Verify a Learnova credential</h1><span class="ws-header__intro">Enter the code printed on the certificate.</span></div></header>
      <form class="ws-toolbar" (submit)="$event.preventDefault(); lookup(code.value)" role="search">
        <label class="ws-field"><span>Verification code</span><input #code [value]="currentCode()" placeholder="LRN-XXXX-2026-0000" autocomplete="off" /></label>
        <button type="submit" class="button button--primary">Verify</button>
      </form>
      @if (loading()) { <app-skeleton [lines]="1" label="Checking credential"></app-skeleton> }
      @else if (result(); as r) {
        <article class="ws-card" aria-live="polite">
          @switch (r.state) {
            @case ('valid') {
              <div class="ws-spread"><app-status-badge label="Valid credential" tone="success"></app-status-badge><code>{{ r.code }}</code></div>
              <h2>{{ r.title }}</h2>
              <dl class="ws-kv"><dt>Holder</dt><dd>{{ r.holder }}</dd><dt>Issuer</dt><dd>{{ r.issuer }}</dd><dt>Issued</dt><dd>{{ r.issuedAt | date: 'MMMM d, y' }}</dd></dl>
              @if (r.skills?.length) { <div class="ws-chips">@for (skill of r.skills; track skill) { <span class="ws-chip">{{ skill }}</span> }</div> }
              @if (r.evidence?.length) { <h3 class="ws-small">Evidence</h3><ul class="ws-small">@for (item of r.evidence; track item) { <li>{{ item }}</li> }</ul> }
            }
            @case ('expired') {
              <app-status-badge label="Expired" tone="warning"></app-status-badge>
              <h2>{{ r.title }}</h2>
              <p>This credential was valid until {{ r.expiresAt | date: 'MMMM d, y' }}. The holder may have renewed it under a new code.</p>
            }
            @case ('revoked') {
              <app-status-badge label="Revoked" tone="danger"></app-status-badge>
              <h2>{{ r.title }}</h2>
              <p>The issuer has revoked this credential. Contact the issuer for details.</p>
            }
            @default {
              <app-status-badge label="Not found" tone="neutral"></app-status-badge>
              <h2>No credential matches this code</h2>
              <p>Check the code for typos. Codes are not case-sensitive.</p>
            }
          }
        </article>
      }
      <p class="ws-small ws-muted">Try sample codes: LRN-A11Y-2026-1842, LRN-OLD-2024-0001, LRN-REV-2025-0042. <a routerLink="/home">Back to home</a></p>
    </section>
  `,
})
export class CredentialVerifyComponent implements OnInit {
  protected readonly result = signal<CredentialVerification | null>(null);
  protected readonly loading = signal(false);
  protected readonly currentCode = signal('');
  private readonly gateway = inject(LearningActivityGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => { this.currentCode.set(params.get('verificationCode') ?? ''); this.loading.set(!!this.currentCode()); }),
        switchMap((params) => this.gateway.verifyCredential(params.get('verificationCode') ?? '')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.result.set(this.currentCode() ? result : null);
        this.loading.set(false);
      });
  }

  protected lookup(code: string): void {
    const trimmed = code.trim();
    if (trimmed) void this.router.navigate(['/credentials', trimmed]);
  }
}
