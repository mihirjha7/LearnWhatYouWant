import { Component, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './app-notifications.html',
  styleUrl: './app-notifications.css',
})
export class AppNotificationsComponent {
  protected readonly notificationService = inject(NotificationService);
}
