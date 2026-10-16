import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/notifications/notification.service';

type IdentityMode = 'forgot' | 'reset' | 'verify' | 'mfa' | 'expired' | 'callback';

@Component({ selector: 'app-identity-flow', standalone: true, imports: [NgIf, ReactiveFormsModule, RouterLink], templateUrl: './identity-flow.html', styleUrls: ['../auth-shared.css', './identity-flow.css'] })
export class IdentityFlowComponent {
  protected readonly mode = inject(ActivatedRoute).snapshot.data['mode'] as IdentityMode;
  protected readonly complete = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly form = this.createForm();
  private readonly notifications = inject(NotificationService);

  protected get title(): string { return { forgot: 'Reset your password', reset: 'Choose a new password', verify: 'Verify your email', mfa: 'Confirm it is you', expired: 'Your session ended safely', callback: 'Completing secure sign in' }[this.mode]; }
  protected get description(): string { return { forgot: 'Enter your email. If an account exists, we will send recovery instructions.', reset: 'Use a strong password you have not used for this account before.', verify: 'Enter the six-digit code from your verification email.', mfa: 'Enter the six-digit code from your authenticator app.', expired: 'Sign in again to return to your work. Safe drafts remain available.', callback: 'Learnova is validating the identity response without exposing account details.' }[this.mode]; }

  protected submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.isSubmitting.set(true); window.setTimeout(() => { this.isSubmitting.set(false); this.complete.set(true); }, 450); }
  protected resend(): void { this.notifications.show('A new code has been requested', { detail: 'Delivery can take a few minutes.', tone: 'info' }); }

  private createForm() {
    const builder = inject(FormBuilder).nonNullable;
    return builder.group({
      email: ['', this.mode === 'forgot' ? [Validators.required, Validators.email] : []],
      code: ['', this.mode === 'verify' || this.mode === 'mfa' ? [Validators.required, Validators.pattern(/^\d{6}$/)] : []],
      password: ['', this.mode === 'reset' ? [Validators.required, Validators.minLength(8)] : []],
      confirmPassword: ['', this.mode === 'reset' ? Validators.required : []],
    });
  }
}
