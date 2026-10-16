import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type PolicyMode = 'privacy' | 'terms' | 'accessibility';

const CONTENT: Record<PolicyMode, { title: string; updated: string; sections: readonly { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy notice',
    updated: 'Draft pending legal approval',
    sections: [
      { heading: 'What we collect', body: 'Account details, learning activity, assessment submissions, and device information needed to keep your account secure.' },
      { heading: 'How we use it', body: 'To deliver courses, record progress, issue credentials, and improve learning recommendations. We never sell personal data.' },
      { heading: 'Your choices', body: 'Control profile visibility, AI assistance, and notifications in Settings. You can request an export or deletion of your data at any time.' },
    ],
  },
  terms: {
    title: 'Terms of use',
    updated: 'Draft pending legal approval',
    sections: [
      { heading: 'Your account', body: 'Keep your credentials private. You are responsible for activity on your account.' },
      { heading: 'Academic integrity', body: 'Submit your own work. Assessment integrity rules are shown before each attempt.' },
      { heading: 'Content', body: 'Course materials are licensed for your personal learning and may not be redistributed.' },
    ],
  },
  accessibility: {
    title: 'Accessibility statement',
    updated: 'Target: WCAG 2.2 AA',
    sections: [
      { heading: 'Our commitment', body: 'Learnova is designed to be usable with keyboards, screen readers, zoom up to 400%, reduced motion, and dark or high-contrast themes.' },
      { heading: 'Learning content', body: 'Video lessons include captions and transcripts where published. Instructors are prompted to resolve accessibility issues before publishing.' },
      { heading: 'Feedback', body: 'If something is difficult to use, contact support and tell us the page and the assistive technology you use. We aim to respond within two business days.' },
    ],
  },
};

@Component({
  selector: 'app-policy-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="container page-section ws-page" style="max-width: 48rem">
      <header><p class="ws-eyebrow">{{ page.updated }}</p><h1>{{ page.title }}</h1></header>
      @for (section of page.sections; track section.heading) {
        <section><h2 style="font-size: 1.25rem; margin-bottom: 0.5rem">{{ section.heading }}</h2><p>{{ section.body }}</p></section>
      }
      <p class="ws-small"><a routerLink="/contact">Contact support</a></p>
    </article>
  `,
})
export class PolicyPageComponent {
  protected readonly page = CONTENT[inject(ActivatedRoute).snapshot.data['mode'] as PolicyMode];
}
