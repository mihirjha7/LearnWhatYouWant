import { CourseLifecycle } from '../../data-access/contracts/instructor.contracts';
import { StatusTone } from '../../shared/ui/primitives';

export const LIFECYCLE: Record<CourseLifecycle, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  'in-review': { label: 'In review', tone: 'info' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  published: { label: 'Published', tone: 'success' },
  archived: { label: 'Archived', tone: 'neutral' },
};
