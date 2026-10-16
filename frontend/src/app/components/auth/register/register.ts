import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth-service';

@Component({ selector: 'app-register', standalone: true, imports: [NgIf, ReactiveFormsModule, RouterLink], templateUrl: './register.html', styleUrl: '../auth-shared.css' })
export class Register {
  protected readonly registerForm = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    consent: [false, Validators.requiredTrue],
  });
  protected readonly showPassword = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private readonly authService = inject(AuthService);

  protected onSubmit(): void {
    const values = this.registerForm.getRawValue();
    if (values.password !== values.confirmPassword) this.registerForm.controls.confirmPassword.setErrors({ mismatch: true });
    if (this.registerForm.invalid || this.isSubmitting()) { this.registerForm.markAllAsTouched(); return; }
    this.isSubmitting.set(true); this.errorMessage.set(null);
    this.authService.register({ name: values.name, email: values.email, password: values.password }).pipe(finalize(() => this.isSubmitting.set(false))).subscribe({ error: () => this.errorMessage.set('We could not create the account. Try another email or retry shortly.') });
  }
}
