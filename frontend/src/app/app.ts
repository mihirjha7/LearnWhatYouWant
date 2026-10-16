import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";
import { AppNotificationsComponent } from './core/notifications/app-notifications';
import { PreferencesService } from './core/preferences/preferences.service';
import { OnlineStatusService } from './core/network/online-status.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, AppNotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly preferences = inject(PreferencesService);
  protected readonly network = inject(OnlineStatusService);
  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url.split('?')[0]),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showPublicChrome = computed(() => {
    const path = this.currentPath();
    return !/^\/(student|instructor|admin|learn|teach|org)(\/|$)/.test(path) &&
      !/^\/course\/[^/]+\/learn(\/|$)/.test(path) &&
      !/^\/course\/[^/]+\/quiz\/[^/]+\/attempt(\/|$)/.test(path);
  });

  protected readonly focusMode = computed(() => !this.showPublicChrome());
}
