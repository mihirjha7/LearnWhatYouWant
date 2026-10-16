import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../auth-shared.css',
})
export class LoginComponent {
  protected readonly loginForm = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  protected preview(role: 'Student' | 'Instructor' | 'Admin'): void {
    this.authService.startPreviewSession(role);
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.authService
      .login(this.loginForm.getRawValue(), this.route.snapshot.queryParamMap.get('returnUrl'))
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        error: () => this.errorMessage.set('Sign in was not completed. Check your details and try again.'),
      });
  }
}
