import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notifications/notification.service';
import {
  AdminConsoleGateway,
  AdminConsoleSnapshot,
  BackgroundJob,
  FeatureFlagState,
  IntegrationStatus,
  ModerationItem,
} from '../../data-access/contracts/admin-console.contracts';
import { MetricCardComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, StatusTone } from '../../shared/ui/primitives';

export type AdminMode = 'overview' | 'roles' | 'moderation' | 'organizations' | 'audit' | 'integrations' | 'jobs' | 'health' | 'flags';

const COPY: Record<AdminMode, { heading: string; intro: string }> = {
  overview: { heading: 'Operations overview', intro: 'Health and attention items first, then trends.' },
  roles: { heading: 'Roles and permissions', intro: 'Permission-based roles. System roles cannot be deleted.' },
  moderation: { heading: 'Content moderation', intro: 'Review publishing requests, category proposals, and learner reports.' },
  organizations: { heading: 'Organizations', intro: 'Tenants, seats, and delegated administration.' },
  audit: { heading: 'Audit log', intro: 'Privileged and security-relevant activity with correlation IDs.' },
  integrations: { heading: 'Integrations', intro: 'Webhooks, SSO, LTI, and delivery health. Secrets are never displayed.' },
  jobs: { heading: 'Background jobs', intro: 'Scheduled processing and retry controls.' },
  health: { heading: 'System health', intro: 'Service status from the last 15 minutes.' },
  flags: { heading: 'Feature flags', intro: 'Roll features out by environment. Production changes require confirmation.' },
};

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent, MetricCardComponent],
  templateUrl: './admin-console.html',
})
export class AdminConsoleComponent implements OnInit {
  protected readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as AdminMode;
  protected readonly copy = COPY[this.mode];
  protected readonly environments = ['development', 'staging', 'production'] as const;
  protected readonly data = signal<AdminConsoleSnapshot | null>(null);
  protected readonly loading = signal(true);
  protected readonly auditQuery = signal('');
  protected readonly auditOutcome = signal('');
  protected readonly busyId = signal<string | null>(null);
  protected readonly filteredAudit = computed(() => {
    const query = this.auditQuery().trim().toLowerCase();
    return (this.data()?.audit ?? []).filter((event) => (!this.auditOutcome() || event.outcome === this.auditOutcome()) && (!query || `${event.actor} ${event.action} ${event.resource} ${event.tenant} ${event.correlationId}`.toLowerCase().includes(query)));
  });
  protected readonly pendingModeration = computed(() => (this.data()?.moderation ?? []).filter((item) => item.status === 'pending').length);
  protected readonly tone: Record<string, StatusTone> = {
    healthy: 'success', operational: 'success', succeeded: 'success', success: 'success', active: 'success', approved: 'success',
    degraded: 'warning', running: 'info', queued: 'neutral', trial: 'info', pending: 'info', 'changes-requested': 'warning',
    failing: 'danger', failed: 'danger', outage: 'danger', denied: 'danger', suspended: 'danger',
  };
  private readonly gateway = inject(AdminConsoleGateway);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.gateway.getSnapshot().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.data.set(data);
      this.loading.set(false);
    });
  }

  protected moderate(item: ModerationItem, decision: 'approved' | 'changes-requested', note: string): void {
    if (decision === 'changes-requested' && !note.trim()) {
      this.notifications.show('Add a note explaining the requested changes', { tone: 'warning' });
      return;
    }
    this.busyId.set(item.id);
    this.gateway.decideModeration(item.id, decision, note).subscribe((updated) => {
      this.patch('moderation', updated);
      this.busyId.set(null);
      this.notifications.show(decision === 'approved' ? 'Approved' : 'Changes requested', { detail: `${item.course} · recorded in audit log`, tone: 'success' });
    });
  }

  protected toggleFlag(flag: FeatureFlagState, environment: 'development' | 'staging' | 'production', input: HTMLInputElement): void {
    const enabled = !flag[environment];
    if (environment === 'production' && !window.confirm(`${enabled ? 'Enable' : 'Disable'} “${flag.key}” in production for all tenants?`)) {
      input.checked = !enabled;
      return;
    }
    this.gateway.setFlag(flag.key, environment, enabled).subscribe((updated) => {
      this.data.update((data) => data ? { ...data, flags: data.flags.map((item) => (item.key === updated.key ? updated : item)) } : data);
      this.notifications.show(`${flag.key} ${enabled ? 'enabled' : 'disabled'} in ${environment}`, { tone: 'success' });
    });
  }

  protected retry(job: BackgroundJob): void {
    this.busyId.set(job.id);
    this.gateway.retryJob(job.id).subscribe((updated) => {
      this.patch('jobs', updated);
      this.busyId.set(null);
      this.notifications.show(`${job.name} restarted`, { tone: 'info' });
    });
  }

  protected replay(integration: IntegrationStatus): void {
    this.busyId.set(integration.id);
    this.gateway.replayIntegration(integration.id).subscribe((updated) => {
      this.patch('integrations', updated);
      this.busyId.set(null);
      this.notifications.show(`Replayed failed deliveries for ${integration.name}`, { tone: 'success' });
    });
  }

  private patch<K extends 'moderation' | 'jobs' | 'integrations'>(key: K, updated: AdminConsoleSnapshot[K][number]): void {
    this.data.update((data) => data ? { ...data, [key]: (data[key] as readonly { id: string }[]).map((item) => (item.id === updated.id ? updated : item)) } : data);
  }
}
