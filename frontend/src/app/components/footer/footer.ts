import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly year = new Date().getFullYear();
  private readonly authService = inject(AuthService);

  protected dashboardLink(): string {
    const role = this.authService.getUserRole();
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  }
}
