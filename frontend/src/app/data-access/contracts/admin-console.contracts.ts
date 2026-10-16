import { Observable } from 'rxjs';

export interface PlatformRole {
  id: string;
  name: string;
  description: string;
  permissions: readonly string[];
  members: number;
  system: boolean;
}

export interface ModerationItem {
  id: string;
  course: string;
  instructor: string;
  submittedAt: string;
  kind: 'publish' | 'category' | 'report';
  issues: readonly string[];
  status: 'pending' | 'approved' | 'changes-requested';
}

export interface OrganizationSummary {
  id: string;
  name: string;
  plan: string;
  seats: number;
  seatsUsed: number;
  domain: string;
  status: 'active' | 'trial' | 'suspended';
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  resource: string;
  tenant: string;
  correlationId: string;
  outcome: 'success' | 'denied' | 'failed';
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: 'Webhook' | 'LTI' | 'SSO' | 'xAPI' | 'Email';
  status: 'healthy' | 'degraded' | 'failing';
  lastDelivery: string;
  failures24h: number;
}

export interface BackgroundJob {
  id: string;
  name: string;
  status: 'succeeded' | 'running' | 'failed' | 'queued';
  lastRun: string;
  durationSeconds: number;
  nextRun: string;
}

export interface ServiceHealth {
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  latencyMs: number;
  detail: string;
}

export interface FeatureFlagState {
  key: string;
  description: string;
  development: boolean;
  staging: boolean;
  production: boolean;
}

export interface AdminConsoleSnapshot {
  attention: readonly { id: string; title: string; detail: string; link: string; tone: 'warning' | 'danger' | 'info' }[];
  roles: readonly PlatformRole[];
  moderation: readonly ModerationItem[];
  organizations: readonly OrganizationSummary[];
  audit: readonly AuditEvent[];
  integrations: readonly IntegrationStatus[];
  jobs: readonly BackgroundJob[];
  health: readonly ServiceHealth[];
  flags: readonly FeatureFlagState[];
}

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: 'Member' | 'Manager' | 'Org admin';
  group: string;
  status: 'active' | 'invited' | 'deactivated';
}

export interface Cohort {
  id: string;
  name: string;
  members: number;
  learning: string;
  dueAt: string;
  completion: number;
  reminders: boolean;
}

export interface OrganizationWorkspace {
  id: string;
  name: string;
  seats: number;
  seatsUsed: number;
  metrics: readonly { label: string; value: string; context: string; tone: 'brand' | 'progress' | 'warm' | 'neutral' }[];
  members: readonly OrganizationMember[];
  cohorts: readonly Cohort[];
  branding: { primaryColor: string; displayName: string; bannerText: string };
  sso: { provider: string; domain: string; status: 'connected' | 'pending' | 'error'; lastTestAt: string; detail: string };
}

export abstract class AdminConsoleGateway {
  abstract getSnapshot(): Observable<AdminConsoleSnapshot>;
  abstract decideModeration(id: string, decision: 'approved' | 'changes-requested', note: string): Observable<ModerationItem>;
  abstract setFlag(key: string, environment: 'development' | 'staging' | 'production', enabled: boolean): Observable<FeatureFlagState>;
  abstract retryJob(id: string): Observable<BackgroundJob>;
  abstract replayIntegration(id: string): Observable<IntegrationStatus>;
  abstract getOrganization(id: string): Observable<OrganizationWorkspace>;
  abstract inviteMembers(organizationId: string, emails: readonly string[], group: string): Observable<readonly OrganizationMember[]>;
  abstract createCohort(organizationId: string, cohort: Omit<Cohort, 'id' | 'completion'>): Observable<Cohort>;
  abstract saveBranding(organizationId: string, branding: OrganizationWorkspace['branding']): Observable<void>;
}
