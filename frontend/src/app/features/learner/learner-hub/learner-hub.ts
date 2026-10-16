import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EngagementSnapshot } from '../../../data-access/contracts/engagement.models';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PreferencesService } from '../../../core/preferences/preferences.service';
import { EngagementFacade } from '../engagement.facade';

type HubMode = 'review' | 'calendar' | 'skills' | 'certificates' | 'notifications' | 'messages' | 'achievements' | 'settings';

@Component({ selector: 'app-learner-hub', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './learner-hub.html', styleUrls: ['./learner-hub.css', './learner-hub-settings.css'] })
export class LearnerHubComponent implements OnInit {
  protected readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as HubMode;
  protected readonly data = signal<EngagementSnapshot | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly reviewIndex = signal(0);
  protected readonly reviewRevealed = signal(false);
  protected readonly reviewComplete = signal(false);
  protected readonly preferences = inject(PreferencesService);
  protected readonly settingsForm = inject(FormBuilder).nonNullable.group({ captions: true, reducedMotion: false, textSize: 'default', playbackSpeed: '1', language: 'English', timezone: 'Asia/Kolkata', profileVisible: false, aiConsent: false });
  protected readonly currentReview = computed(() => this.data()?.reviewCards[this.reviewIndex()] ?? null);
  private readonly engagement = inject(EngagementFacade);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected get title(): string { return { review: 'Daily review', calendar: 'Calendar', skills: 'Skills', certificates: 'Certificates', notifications: 'Notifications', messages: 'Messages', achievements: 'Achievements', settings: 'Settings' }[this.mode]; }
  protected get intro(): string { return { review: 'Strengthen useful concepts before they fade.', calendar: 'See deadlines, live sessions, lessons, and reviews in your time zone.', skills: 'Understand what you can do, the evidence behind it, and what to build next.', certificates: 'Keep verifiable proof of completed learning.', notifications: 'Review feedback and deadlines without losing the signal.', messages: 'Keep course conversations focused and private.', achievements: 'A record of meaningful milestones, without pressure.', settings: 'Control your learning, accessibility, privacy, and active sessions.' }[this.mode]; }

  ngOnInit(): void { this.engagement.getSnapshot().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => { this.data.set(data); this.isLoading.set(false); }); }

  protected revealReview(): void { this.reviewRevealed.set(true); }
  protected rateReview(rating: 'again' | 'hard' | 'good' | 'easy'): void {
    const card = this.currentReview(); if (!card) return;
    this.engagement.rateReview(card.id, rating).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const nextIndex = this.reviewIndex() + 1;
      if (nextIndex >= (this.data()?.reviewCards.length ?? 0)) this.reviewComplete.set(true);
      else { this.reviewIndex.set(nextIndex); this.reviewRevealed.set(false); }
    });
  }
  protected markAllRead(): void { const snapshot = this.data(); if (!snapshot) return; const ids = snapshot.notifications.filter((item) => !item.read).map((item) => item.id); this.engagement.markNotificationsRead(ids).subscribe(() => this.data.update((value) => value ? { ...value, notifications: value.notifications.map((item) => ({ ...item, read: true })) } : value)); }
  protected revokeSession(sessionId: string): void { this.engagement.revokeSession(sessionId).subscribe(() => { this.data.update((value) => value ? { ...value, sessions: value.sessions.filter((session) => session.id !== sessionId) } : value); this.notifications.show('Session revoked', { tone: 'success' }); }); }
  protected saveSettings(): void { this.notifications.show('Preferences saved', { detail: 'Your accessibility and privacy choices are active.', tone: 'success' }); }
}
