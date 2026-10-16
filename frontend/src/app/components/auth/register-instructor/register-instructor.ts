import { NgIf } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth-service';

@Component({ selector: 'app-register-instructor', standalone: true, imports: [NgIf, ReactiveFormsModule, RouterLink], templateUrl: './register-instructor.html', styleUrl: '../auth-shared.css' })
export class RegisterInstructor {
  protected readonly registerForm = inject(FormBuilder).nonNullable.group({ name: ['', [Validators.required, Validators.minLength(2)]], email: ['', [Validators.required, Validators.email]], expertise: ['', [Validators.required, Validators.minLength(3)]], password: ['', [Validators.required, Validators.minLength(8)]], policy: [false, Validators.requiredTrue] });
  protected readonly showPassword = signal(false); protected readonly isSubmitting = signal(false); protected readonly errorMessage = signal<string | null>(null);
  private readonly authService = inject(AuthService);
  protected onSubmit(): void { if (this.registerForm.invalid || this.isSubmitting()) { this.registerForm.markAllAsTouched(); return; } const { name, email, password } = this.registerForm.getRawValue(); this.isSubmitting.set(true); this.errorMessage.set(null); this.authService.registerInstructor({ name, email, password }).pipe(finalize(() => this.isSubmitting.set(false))).subscribe({ error: () => this.errorMessage.set('Your teaching application could not be submitted. Please retry shortly.') }); }
}
