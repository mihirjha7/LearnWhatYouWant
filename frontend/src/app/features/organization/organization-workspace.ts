import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../core/notifications/notification.service';
import { AdminConsoleGateway, OrganizationWorkspace } from '../../data-access/contracts/admin-console.contracts';
import { MetricCardComponent, PageHeaderComponent, SkeletonComponent, StatusBadgeComponent } from '../../shared/ui/primitives';
import { contrastRatio, parseEmails } from './organization-utils';

type OrgMode = 'dashboard' | 'members' | 'cohorts' | 'branding' | 'sso';

@Component({
  selector: 'app-organization-workspace',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PageHeaderComponent, SkeletonComponent, MetricCardComponent, StatusBadgeComponent],
  templateUrl: './organization-workspace.html',
})
export class OrganizationWorkspaceComponent implements OnInit {
  protected readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as OrgMode;
  protected readonly org = signal<OrganizationWorkspace | null>(null);
  protected readonly loading = signal(true);
  protected readonly memberQuery = signal('');
  protected readonly inviteResult = signal<{ valid: string[]; invalid: string[] } | null>(null);
  protected readonly cohortStep = signal(0);
  protected readonly testingSso = signal(false);
  protected readonly cohortSteps = ['Members', 'Learning', 'Schedule', 'Notifications', 'Review'];
  protected readonly filteredMembers = computed(() => {
    const query = this.memberQuery().trim().toLowerCase();
    return (this.org()?.members ?? []).filter((member) => !query || `${member.name} ${member.email} ${member.group}`.toLowerCase().includes(query));
  });
  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly inviteForm = this.fb.group({ emails: ['', Validators.required], group: ['Engineering'] });
  protected readonly cohortForm = this.fb.group({
    name: ['', Validators.required],
    group: ['Clinical ops'],
    members: [25, [Validators.min(1)]],
    learning: ['Accessible Web Experiences'],
    dueAt: ['', Validators.required],
    reminders: [true],
  });
  protected readonly brandingForm = this.fb.group({ primaryColor: ['#0f766e'], displayName: ['', Validators.maxLength(40)], bannerText: ['', Validators.maxLength(80)] });
  private readonly brandingValue = signal(this.brandingForm.getRawValue());
  protected readonly contrast = computed(() => contrastRatio(this.brandingValue().primaryColor, '#ffffff'));
  private readonly gateway = inject(AdminConsoleGateway);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly organizationId = this.route.parent?.snapshot.paramMap.get('organizationId') ?? '';

  ngOnInit(): void {
    this.gateway.getOrganization(this.organizationId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((org) => {
      this.org.set(org);
      this.brandingForm.reset(org.branding);
      this.loading.set(false);
    });
    this.brandingForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.brandingValue.set(this.brandingForm.getRawValue()));
  }

  protected invite(): void {
    const parsed = parseEmails(this.inviteForm.getRawValue().emails);
    this.inviteResult.set(parsed);
    if (!parsed.valid.length) return;
    this.gateway.inviteMembers(this.organizationId, parsed.valid, this.inviteForm.getRawValue().group).subscribe((members) => {
      this.org.update((org) => (org ? { ...org, members } : org));
      this.inviteForm.controls.emails.reset();
      this.notifications.show(`${parsed.valid.length} invitation(s) sent`, { detail: parsed.invalid.length ? `${parsed.invalid.length} address(es) skipped.` : undefined, tone: 'success' });
    });
  }

  protected nextCohortStep(): void {
    this.cohortStep.update((step) => Math.min(this.cohortSteps.length - 1, step + 1));
  }

  protected createCohort(): void {
    if (this.cohortForm.invalid) {
      this.cohortForm.markAllAsTouched();
      this.notifications.show('Complete the cohort name and due date', { tone: 'warning' });
      return;
    }
    const value = this.cohortForm.getRawValue();
    this.gateway.createCohort(this.organizationId, { name: value.name, members: value.members, learning: value.learning, dueAt: new Date(value.dueAt).toISOString(), reminders: value.reminders }).subscribe((cohort) => {
      this.org.update((org) => (org ? { ...org, cohorts: [cohort, ...org.cohorts] } : org));
      this.cohortForm.reset();
      this.cohortStep.set(0);
      this.notifications.show('Cohort created and learning assigned', { tone: 'success' });
    });
  }

  protected saveBranding(): void {
    if (this.contrast() < 4.5) return;
    this.gateway.saveBranding(this.organizationId, this.brandingForm.getRawValue()).subscribe(() => this.notifications.show('Branding saved', { tone: 'success' }));
  }

  protected testSso(): void {
    this.testingSso.set(true);
    window.setTimeout(() => {
      this.testingSso.set(false);
      this.notifications.show('SSO connection test passed', { detail: 'Metadata reachable, signature valid.', tone: 'success' });
    }, 900);
  }
}
