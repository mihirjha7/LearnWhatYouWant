import { Injectable } from '@angular/core';
import { Observable, defer, delay, of, throwError } from 'rxjs';
import {
  AdminConsoleGateway,
  AdminConsoleSnapshot,
  BackgroundJob,
  Cohort,
  FeatureFlagState,
  IntegrationStatus,
  ModerationItem,
  OrganizationMember,
  OrganizationWorkspace,
} from '../contracts/admin-console.contracts';

const SNAPSHOT: AdminConsoleSnapshot = {
  attention: [
    { id: 'att-1', title: '2 courses awaiting review', detail: 'Oldest submitted 3 days ago', link: '/admin/moderation', tone: 'warning' },
    { id: 'att-2', title: 'Nightly transcript job failed', detail: 'Last run 02:00 UTC · 14 lessons affected', link: '/admin/jobs', tone: 'danger' },
    { id: 'att-3', title: 'Webhook delivery degraded', detail: 'HR sync · 6 failures in 24 hours', link: '/admin/integrations', tone: 'warning' },
    { id: 'att-4', title: 'SSO certificate expires in 21 days', detail: 'Northwind Health', link: '/admin/organizations', tone: 'info' },
  ],
  roles: [
    { id: 'role-admin', name: 'Platform administrator', description: 'Full platform configuration and user management.', permissions: ['admin.access', 'users.manage', 'courses.moderate', 'flags.manage', 'audit.read'], members: 3, system: true },
    { id: 'role-instructor', name: 'Instructor', description: 'Create and manage owned courses, assessments, and grading.', permissions: ['teach.access', 'courses.manage', 'assessments.manage', 'grading.manage'], members: 42, system: true },
    { id: 'role-learner', name: 'Learner', description: 'Enroll, learn, and submit work.', permissions: ['learn.access', 'courses.enroll', 'assessments.attempt'], members: 12804, system: true },
    { id: 'role-grader', name: 'Grader', description: 'Grade assigned submissions without editing course content.', permissions: ['grading.manage'], members: 11, system: false },
    { id: 'role-support', name: 'Support agent', description: 'View users and sessions; cannot change grades or content.', permissions: ['users.read', 'sessions.revoke', 'audit.read'], members: 6, system: false },
  ],
  moderation: [
    { id: 'mod-1', course: 'Reliable Cloud API Design', instructor: 'Priya Nair', submittedAt: '2026-10-11T09:00:00Z', kind: 'publish', issues: ['1 video missing captions', 'Pricing set to organization-only'], status: 'pending' },
    { id: 'mod-2', course: 'Negotiation Fundamentals', instructor: 'Tom Becker', submittedAt: '2026-10-13T14:00:00Z', kind: 'publish', issues: [], status: 'pending' },
    { id: 'mod-3', course: 'New category: Sustainability', instructor: 'Elena Torres', submittedAt: '2026-10-12T10:30:00Z', kind: 'category', issues: ['Overlaps with "Leadership > ESG"'], status: 'pending' },
    { id: 'mod-4', course: 'Crypto Trading Secrets', instructor: 'Unknown Seller', submittedAt: '2026-10-09T08:00:00Z', kind: 'report', issues: ['Reported by 4 learners: misleading claims'], status: 'pending' },
  ],
  organizations: [
    { id: 'org-northwind', name: 'Northwind Health', plan: 'Enterprise', seats: 1500, seatsUsed: 1312, domain: 'northwind.example', status: 'active' },
    { id: 'org-contoso', name: 'Contoso Engineering', plan: 'Business', seats: 400, seatsUsed: 388, domain: 'contoso.example', status: 'active' },
    { id: 'org-fabrikam', name: 'Fabrikam University', plan: 'Education trial', seats: 250, seatsUsed: 61, domain: 'fabrikam.edu', status: 'trial' },
  ],
  audit: [
    { id: 'aud-1', at: '2026-10-14T08:42:00Z', actor: 'jordan.lee', action: 'role.assign', resource: 'user:leo.martins → Grader', tenant: 'Platform', correlationId: '7f3c-19ab', outcome: 'success' },
    { id: 'aud-2', at: '2026-10-14T08:10:00Z', actor: 'priya.nair', action: 'course.submit_review', resource: 'course:cloud-api-design', tenant: 'Platform', correlationId: '2be1-88c0', outcome: 'success' },
    { id: 'aud-3', at: '2026-10-14T07:55:00Z', actor: 'unknown', action: 'admin.login', resource: 'session', tenant: 'Platform', correlationId: 'c901-3d2f', outcome: 'denied' },
    { id: 'aud-4', at: '2026-10-13T22:02:00Z', actor: 'system', action: 'job.transcripts', resource: 'job:nightly-transcripts', tenant: 'Platform', correlationId: 'aa07-55e1', outcome: 'failed' },
    { id: 'aud-5', at: '2026-10-13T17:31:00Z', actor: 'nina.ortiz', action: 'cohort.assign', resource: 'cohort:new-managers-q4', tenant: 'Northwind Health', correlationId: '41d8-0c6b', outcome: 'success' },
  ],
  integrations: [
    { id: 'int-1', name: 'HR roster sync', type: 'Webhook', status: 'degraded', lastDelivery: '2026-10-14T08:00:00Z', failures24h: 6 },
    { id: 'int-2', name: 'Northwind Entra ID', type: 'SSO', status: 'healthy', lastDelivery: '2026-10-14T08:40:00Z', failures24h: 0 },
    { id: 'int-3', name: 'Fabrikam Canvas', type: 'LTI', status: 'healthy', lastDelivery: '2026-10-14T07:12:00Z', failures24h: 0 },
    { id: 'int-4', name: 'Learning record store', type: 'xAPI', status: 'failing', lastDelivery: '2026-10-13T19:00:00Z', failures24h: 31 },
    { id: 'int-5', name: 'Transactional email', type: 'Email', status: 'healthy', lastDelivery: '2026-10-14T08:41:00Z', failures24h: 1 },
  ],
  jobs: [
    { id: 'job-1', name: 'Nightly transcripts', status: 'failed', lastRun: '2026-10-14T02:00:00Z', durationSeconds: 312, nextRun: '2026-10-15T02:00:00Z' },
    { id: 'job-2', name: 'Spaced review scheduling', status: 'succeeded', lastRun: '2026-10-14T03:00:00Z', durationSeconds: 48, nextRun: '2026-10-15T03:00:00Z' },
    { id: 'job-3', name: 'Certificate issuance', status: 'running', lastRun: '2026-10-14T08:30:00Z', durationSeconds: 0, nextRun: '2026-10-14T09:30:00Z' },
    { id: 'job-4', name: 'Analytics aggregation', status: 'queued', lastRun: '2026-10-14T01:00:00Z', durationSeconds: 640, nextRun: '2026-10-14T09:00:00Z' },
  ],
  health: [
    { service: 'API gateway', status: 'operational', latencyMs: 84, detail: 'p95 over last 15 minutes' },
    { service: 'Media processing', status: 'degraded', latencyMs: 2300, detail: 'Transcoding queue backlog of 42 items' },
    { service: 'Realtime (SignalR)', status: 'operational', latencyMs: 41, detail: '1,204 active connections' },
    { service: 'Search index', status: 'operational', latencyMs: 120, detail: 'Last rebuild 2 hours ago' },
    { service: 'Object storage', status: 'operational', latencyMs: 66, detail: 'Signed uploads healthy' },
  ],
  flags: [
    { key: 'mockPlatform', description: 'Fallback to mock gateways when legacy APIs fail.', development: true, staging: true, production: false },
    { key: 'learningPaths', description: 'Learning paths in catalog and dashboard.', development: true, staging: true, production: true },
    { key: 'dailyReview', description: 'Spaced repetition review queue.', development: true, staging: true, production: false },
    { key: 'liveLearning', description: 'Live sessions and classroom tools.', development: true, staging: false, production: false },
    { key: 'labs', description: 'Interactive code labs.', development: true, staging: false, production: false },
    { key: 'enterprise', description: 'Organization administration workspace.', development: true, staging: true, production: false },
  ],
};

const ORGANIZATION: OrganizationWorkspace = {
  id: 'org-northwind',
  name: 'Northwind Health',
  seats: 1500,
  seatsUsed: 1312,
  metrics: [
    { label: 'Assignment compliance', value: '87%', context: 'Mandatory training on time', tone: 'progress' },
    { label: 'Activated members', value: '1,204', context: '92% of provisioned seats', tone: 'brand' },
    { label: 'Average mastery', value: '71%', context: 'Assigned skills', tone: 'neutral' },
    { label: 'Overdue learners', value: '58', context: 'Reminders scheduled', tone: 'warm' },
  ],
  members: [
    { id: 'm-1', name: 'Nina Ortiz', email: 'nina.ortiz@northwind.example', role: 'Org admin', group: 'People team', status: 'active' },
    { id: 'm-2', name: 'Raj Mehta', email: 'raj.mehta@northwind.example', role: 'Manager', group: 'Clinical ops', status: 'active' },
    { id: 'm-3', name: 'Olivia Brown', email: 'olivia.brown@northwind.example', role: 'Member', group: 'Clinical ops', status: 'active' },
    { id: 'm-4', name: 'Ken Ito', email: 'ken.ito@northwind.example', role: 'Member', group: 'Engineering', status: 'invited' },
    { id: 'm-5', name: 'Grace Kim', email: 'grace.kim@northwind.example', role: 'Member', group: 'Engineering', status: 'deactivated' },
  ],
  cohorts: [
    { id: 'c-1', name: 'New managers Q4', members: 46, learning: 'Product Leadership Essentials', dueAt: '2026-12-15T17:00:00Z', completion: 38, reminders: true },
    { id: 'c-2', name: 'Annual privacy refresher', members: 1180, learning: 'Data Privacy Essentials', dueAt: '2026-11-01T17:00:00Z', completion: 81, reminders: true },
    { id: 'c-3', name: 'Accessibility champions', members: 22, learning: 'Accessible Web Experiences', dueAt: '2027-01-20T17:00:00Z', completion: 12, reminders: false },
  ],
  branding: { primaryColor: '#0f766e', displayName: 'Northwind Learning', bannerText: 'Grow your skills with Northwind.' },
  sso: { provider: 'Microsoft Entra ID', domain: 'northwind.example', status: 'connected', lastTestAt: '2026-10-14T06:00:00Z', detail: 'Signing certificate valid until 2026-11-04. Rotate before expiry.' },
};

@Injectable({ providedIn: 'root' })
export class MockAdminConsoleGateway extends AdminConsoleGateway {
  private snapshot: AdminConsoleSnapshot = SNAPSHOT;
  private organization: OrganizationWorkspace = ORGANIZATION;

  getSnapshot(): Observable<AdminConsoleSnapshot> {
    return defer(() => of(this.snapshot)).pipe(delay(180));
  }

  decideModeration(id: string, decision: 'approved' | 'changes-requested', _note: string): Observable<ModerationItem> {
    return defer(() => {
      const item = this.snapshot.moderation.find((entry) => entry.id === id);
      if (!item) return throwError(() => ({ status: 404 }));
      const updated = { ...item, status: decision };
      this.snapshot = { ...this.snapshot, moderation: this.snapshot.moderation.map((entry) => (entry.id === id ? updated : entry)) };
      return of(updated);
    }).pipe(delay(240));
  }

  setFlag(key: string, environment: 'development' | 'staging' | 'production', enabled: boolean): Observable<FeatureFlagState> {
    return defer(() => {
      const flag = this.snapshot.flags.find((entry) => entry.key === key);
      if (!flag) return throwError(() => ({ status: 404 }));
      const updated = { ...flag, [environment]: enabled };
      this.snapshot = { ...this.snapshot, flags: this.snapshot.flags.map((entry) => (entry.key === key ? updated : entry)) };
      return of(updated);
    }).pipe(delay(200));
  }

  retryJob(id: string): Observable<BackgroundJob> {
    return this.updateEntry('jobs', id, { status: 'running', lastRun: new Date().toISOString() } as Partial<BackgroundJob>) as Observable<BackgroundJob>;
  }

  replayIntegration(id: string): Observable<IntegrationStatus> {
    return this.updateEntry('integrations', id, { status: 'healthy', failures24h: 0, lastDelivery: new Date().toISOString() } as Partial<IntegrationStatus>) as Observable<IntegrationStatus>;
  }

  getOrganization(id: string): Observable<OrganizationWorkspace> {
    return defer(() => of({ ...this.organization, id, name: this.snapshot.organizations.find((org) => org.id === id)?.name ?? this.organization.name })).pipe(delay(180));
  }

  inviteMembers(_organizationId: string, emails: readonly string[], group: string): Observable<readonly OrganizationMember[]> {
    return defer(() => {
      const invited = emails.map((email, index) => ({ id: `m-${Date.now()}-${index}`, name: email.split('@')[0], email, role: 'Member' as const, group, status: 'invited' as const }));
      this.organization = { ...this.organization, members: [...invited, ...this.organization.members] };
      return of(this.organization.members);
    }).pipe(delay(300));
  }

  createCohort(_organizationId: string, cohort: Omit<Cohort, 'id' | 'completion'>): Observable<Cohort> {
    return defer(() => {
      const created = { ...cohort, id: `c-${Date.now().toString(36)}`, completion: 0 };
      this.organization = { ...this.organization, cohorts: [created, ...this.organization.cohorts] };
      return of(created);
    }).pipe(delay(300));
  }

  saveBranding(_organizationId: string, branding: OrganizationWorkspace['branding']): Observable<void> {
    return defer(() => {
      this.organization = { ...this.organization, branding };
      return of(undefined);
    }).pipe(delay(240));
  }

  private updateEntry(collection: 'jobs' | 'integrations', id: string, change: object): Observable<unknown> {
    return defer(() => {
      const list = this.snapshot[collection] as readonly { id: string }[];
      const item = list.find((entry) => entry.id === id);
      if (!item) return throwError(() => ({ status: 404 }));
      const updated = { ...item, ...change };
      this.snapshot = { ...this.snapshot, [collection]: list.map((entry) => (entry.id === id ? updated : entry)) };
      return of(updated);
    }).pipe(delay(320));
  }
}
