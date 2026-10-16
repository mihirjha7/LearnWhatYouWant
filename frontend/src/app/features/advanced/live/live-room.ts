import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdvancedLearningGateway, LiveRoom } from '../../../data-access/contracts/advanced-learning.contracts';
import { EmptyStateComponent, SkeletonComponent, StatusBadgeComponent } from '../../../shared/ui/primitives';

@Component({
  selector: 'app-live-room',
  standalone: true,
  imports: [DatePipe, RouterLink, SkeletonComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="ws-focus">
      <header class="ws-focus__bar">
        <a routerLink="/student/live">&larr; Leave session</a>
        @if (room(); as r) { <strong>{{ r.session.title }}</strong><app-status-badge [label]="r.session.status === 'live' ? 'Live' : r.session.status" [tone]="r.session.status === 'live' ? 'danger' : 'info'"></app-status-badge> }
      </header>
      <div class="ws-focus__body">
        @if (loading()) { <app-skeleton [lines]="2" label="Connecting"></app-skeleton> }
        @else if (room(); as r) {
          @if (!joined()) {
            <section class="ws-card" style="max-width: 40rem; margin-inline: auto" aria-labelledby="ready-title">
              <h1 id="ready-title" style="font-size: 1.5rem">Ready to join?</h1>
              <p class="ws-muted">{{ r.session.course }} · hosted by {{ r.session.host }} · {{ r.session.startsAt | date: 'MMM d, h:mm a' }}</p>
              <ul class="ws-list">
                <li><span class="ws-item__body"><strong>Microphone</strong><span>Muted on entry</span></span><span class="status status--success">Ready</span></li>
                <li><span class="ws-item__body"><strong>Camera</strong><span>Off by default</span></span><span class="status status--success">Ready</span></li>
                <li><span class="ws-item__body"><strong>Live captions</strong><span>Auto-generated, English</span></span><span class="status status--info">Available</span></li>
              </ul>
              <label class="ws-check"><input type="checkbox" (change)="consent.set($any($event.target).checked)" /> I understand attendance is recorded for this course.</label>
              <button type="button" class="button button--primary" [disabled]="!consent() || r.session.status !== 'live'" (click)="joined.set(true)">{{ r.session.status === 'live' ? 'Join now' : 'Opens at start time' }}</button>
              <h2 class="ws-card__title">Agenda</h2>
              <ol class="ws-small">@for (item of r.agenda; track item) { <li>{{ item }}</li> }</ol>
            </section>
          } @else {
            <div class="ws-split">
              <div class="ws-stack">
                <div class="media-16x9" style="display: grid; place-items: center; color: #e2e8f0">
                  <div style="text-align: center"><strong>{{ r.session.host }} is presenting</strong><p class="ws-small">Shared screen · captions on</p></div>
                </div>
                <p class="ws-banner" aria-live="polite"><strong>Captions:</strong> “…so the facade gives every component one stable API, regardless of where the data comes from.”</p>
                <div class="ws-row-flex">
                  <button type="button" class="button" [attr.aria-pressed]="muted()" (click)="muted.set(!muted())">{{ muted() ? 'Unmute' : 'Mute' }}</button>
                  <button type="button" class="button" [attr.aria-pressed]="handRaised()" (click)="handRaised.set(!handRaised())">{{ handRaised() ? 'Lower hand' : 'Raise hand' }}</button>
                  @for (reaction of reactions; track reaction.label) { <button type="button" class="button button--sm" [attr.aria-label]="'React ' + reaction.label" (click)="react(reaction.label)">{{ reaction.symbol }}</button> }
                </div>
                @if (r.poll; as poll) {
                  <section class="ws-card" aria-labelledby="poll-title">
                    <h2 id="poll-title" class="ws-card__title">Poll: {{ poll.question }}</h2>
                    @for (option of poll.options; track option.id) {
                      <label class="ws-option"><input type="radio" name="poll" [disabled]="!!vote()" (change)="vote.set(option.id)" /><span style="flex: 1">{{ option.label }}</span>@if (vote()) { <strong>{{ option.votes + (vote() === option.id ? 1 : 0) }}</strong> }</label>
                    }
                  </section>
                }
              </div>
              <aside class="ws-stack">
                <section class="ws-card" aria-labelledby="people-title">
                  <h2 id="people-title" class="ws-card__title">Participants ({{ r.participants.length + 1 }})</h2>
                  <ul class="ws-list ws-small">
                    <li>You @if (handRaised()) { <span class="ws-chip">Hand raised</span> }</li>
                    @for (person of r.participants; track person.id) { <li>{{ person.name }} @if (person.role === 'Host') { <span class="ws-chip">Host</span> } @if (person.handRaised) { <span class="ws-chip">Hand raised</span> }</li> }
                  </ul>
                </section>
                <section class="ws-card" aria-labelledby="chat-title">
                  <h2 id="chat-title" class="ws-card__title">Chat</h2>
                  <div class="ws-chat" role="log" aria-live="polite" style="max-height: 16rem">
                    @for (message of chat(); track message.id) { <div class="ws-bubble" [class.ws-bubble--self]="message.author === 'You'"><strong class="ws-xs">{{ message.author }}</strong><p>{{ message.body }}</p></div> }
                  </div>
                  <form class="ws-row-flex" style="flex-wrap: nowrap" (submit)="$event.preventDefault(); send(chatInput.value); chatInput.value = ''">
                    <label class="sr-only" for="live-chat">Message</label><input id="live-chat" #chatInput maxlength="300" autocomplete="off" /><button class="button button--sm" type="submit">Send</button>
                  </form>
                </section>
              </aside>
            </div>
          }
        } @else { <app-empty-state tone="error" heading="Session not found" actionLabel="All sessions" actionLink="/student/live"></app-empty-state> }
      </div>
    </div>
  `,
})
export class LiveRoomComponent implements OnInit {
  protected readonly room = signal<LiveRoom | null>(null);
  protected readonly loading = signal(true);
  protected readonly joined = signal(false);
  protected readonly consent = signal(false);
  protected readonly muted = signal(true);
  protected readonly handRaised = signal(false);
  protected readonly vote = signal<string | null>(null);
  protected readonly extraChat = signal<readonly { id: string; author: string; body: string; at: string }[]>([]);
  protected readonly chat = computed(() => [...(this.room()?.chat ?? []), ...this.extraChat()]);
  protected readonly reactions = [{ label: 'thumbs up', symbol: '👍' }, { label: 'clap', symbol: '👏' }, { label: 'question', symbol: '❓' }];
  private readonly gateway = inject(AdvancedLearningGateway);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.getLiveRoom(this.route.snapshot.paramMap.get('sessionId') ?? '').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (room) => { this.room.set(room); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected send(body: string): void {
    if (!body.trim()) return;
    this.extraChat.update((items) => [...items, { id: `local-${items.length}`, author: 'You', body: body.trim(), at: new Date().toISOString() }]);
  }

  protected react(label: string): void {
    this.send(`(${label})`);
  }
}
