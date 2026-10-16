import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-route-state',
  imports: [RouterLink],
  templateUrl: './route-state.html',
  styleUrl: './route-state.css',
})
export class RouteStateComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly code = this.route.snapshot.data['code'] as string;
  protected readonly eyebrow = this.route.snapshot.data['eyebrow'] as string;
  protected readonly heading = this.route.snapshot.data['heading'] as string;
  protected readonly message = this.route.snapshot.data['message'] as string;
  protected readonly actionLabel = this.route.snapshot.data['actionLabel'] as string;
  protected readonly actionLink = this.route.snapshot.data['actionLink'] as string;
}
