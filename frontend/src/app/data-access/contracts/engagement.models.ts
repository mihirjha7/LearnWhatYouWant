export interface ReviewCard {
  id: string;
  prompt: string;
  answer: string;
  source: string;
  skill: string;
}

export interface ScheduleItem {
  id: string;
  startsAt: string;
  title: string;
  context: string;
  type: 'deadline' | 'live' | 'lesson' | 'review';
}

export interface SkillEvidence {
  id: string;
  skill: string;
  mastery: number;
  confidence: 'Developing' | 'Established' | 'Strong';
  evidence: readonly string[];
  lastVerifiedAt: string;
  reason: string;
}

export interface CertificateSummary {
  id: string;
  title: string;
  issuedAt: string;
  verificationCode: string;
  status: 'valid' | 'expired' | 'revoked';
  skills: readonly string[];
}

export interface LearnerNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: 'feedback' | 'deadline' | 'course' | 'system';
  read: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
}

export interface MessageThread {
  id: string;
  participant: string;
  subject: string;
  preview: string;
  updatedAt: string;
  unread: boolean;
}

export interface AchievementSummary {
  id: string;
  title: string;
  description: string;
  earnedAt: string;
  category: string;
}

export interface EngagementSnapshot {
  reviewCards: readonly ReviewCard[];
  schedule: readonly ScheduleItem[];
  skills: readonly SkillEvidence[];
  certificates: readonly CertificateSummary[];
  notifications: readonly LearnerNotification[];
  sessions: readonly ActiveSession[];
  messages: readonly MessageThread[];
  achievements: readonly AchievementSummary[];
}
