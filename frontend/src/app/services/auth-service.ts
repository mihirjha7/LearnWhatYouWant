import { HttpClient } from '@angular/common/http';
import { Injectable, inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { RuntimeConfigService } from '../core/config/runtime-config';
import { AuthTokenStore } from '../core/session/auth-token-store';

export type UserRole = 'Admin' | 'Instructor' | 'Student' | 'Unknown';

export interface SessionUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  permissions: readonly string[];
}

interface JwtClaims {
  nameid?: string;
  sub?: string;
  role?: string;
  name?: string;
  unique_name?: string;
  email?: string;
  permissions?: string[] | string;
  permission?: string[] | string;
  exp?: number;
  [claim: string]: unknown;
}

export interface AuthResponse {
  accessToken: string;
}

const ROLE_PERMISSIONS: Record<UserRole, readonly string[]> = {
  Admin: ['admin.access', 'users.manage', 'courses.moderate'],
  Instructor: ['teach.access', 'courses.manage', 'assessments.manage'],
  Student: ['learn.access', 'courses.enroll', 'assessments.attempt'],
  Unknown: [],
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly config = inject(RuntimeConfigService);
  private readonly tokenStore = inject(AuthTokenStore);
  private readonly initialUser = this.decodeStoredUser();
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(this.initialUser !== null);
  private readonly currentUserSubject = new BehaviorSubject<SessionUser | null>(this.initialUser);

  readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();
  readonly currentUser$ = this.currentUserSubject.asObservable();

  getCurrentUserId(): number | null {
    const id = this.currentUserSubject.value?.id;
    if (!id) return null;
    const numericId = Number.parseInt(id, 10);
    return Number.isNaN(numericId) ? null : numericId;
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenStore.read();
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  hasPermission(permission: string): boolean {
    return this.currentUserSubject.value?.permissions.includes(permission) ?? false;
  }

  login(
    credentials: { email: string; password: string },
    returnUrl?: string | null,
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.config.apiUrl('Auth/login'), credentials).pipe(
      tap((response) => this.handleAuthentication(response.accessToken, returnUrl)),
    );
  }

  register(userDetails: {
    name: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.config.apiUrl('Auth/register'), userDetails).pipe(
      tap((response) => this.handleAuthentication(response.accessToken)),
    );
  }

  registerInstructor(userDetails: {
    name: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.config.apiUrl('Auth/register/instructor'), userDetails)
      .pipe(tap((response) => this.handleAuthentication(response.accessToken)));
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  /** Mock-platform preview only; the unsigned token is never accepted by the backend. */
  canStartPreviewSession(): boolean {
    return isDevMode() && this.config.isFeatureEnabled('mockPlatform');
  }

  startPreviewSession(role: Exclude<UserRole, 'Unknown'>): void {
    if (!this.canStartPreviewSession()) return;
    const names: Record<typeof role, string> = { Student: 'Aisha Patel', Instructor: 'Maya Chen', Admin: 'Jordan Lee' };
    const encode = (value: object) =>
      btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
    const token = `${encode({ alg: 'none', typ: 'JWT' })}.${encode({
      sub: `preview-${role.toLowerCase()}`,
      name: names[role],
      email: `${role.toLowerCase()}@preview.learnova.local`,
      role,
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    })}.preview`;
    this.handleAuthentication(token);
  }

  private handleAuthentication(token: string, returnUrl?: string | null): void {
    this.tokenStore.write(token);
    const user = this.decodeToken(token);
    if (!user) {
      this.clearSession();
      return;
    }

    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next(user);
    void this.router.navigateByUrl(this.safeReturnUrl(returnUrl) ?? this.homeForRole(user.role));
  }

  private decodeStoredUser(): SessionUser | null {
    const token = this.tokenStore.read();
    if (!token) return null;
    const user = this.decodeToken(token);
    if (!user) this.tokenStore.clear();
    return user;
  }

  private decodeToken(token: string): SessionUser | null {
    try {
      const claims = jwtDecode<JwtClaims>(token);
      if (claims.exp && claims.exp * 1000 <= Date.now()) return null;

      const role = this.normalizeRole(this.readRole(claims));
      const explicitPermissions = this.readPermissions(claims);
      return {
        id: String(claims.nameid ?? claims.sub ?? ''),
        displayName: String(claims.name ?? claims.unique_name ?? 'Learner'),
        email: String(claims.email ?? ''),
        role,
        permissions: explicitPermissions.length ? explicitPermissions : ROLE_PERMISSIONS[role],
      };
    } catch {
      return null;
    }
  }

  private readRole(claims: JwtClaims): string {
    return String(
      claims.role ??
        claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        '',
    );
  }

  private readPermissions(claims: JwtClaims): string[] {
    const value = claims.permissions ?? claims.permission;
    if (Array.isArray(value)) {
      return value.filter((permission): permission is string => typeof permission === 'string');
    }
    return typeof value === 'string' ? value.split(' ').filter(Boolean) : [];
  }

  private normalizeRole(value: string): UserRole {
    const normalized = value.toLowerCase();
    if (normalized === 'admin') return 'Admin';
    if (normalized === 'instructor') return 'Instructor';
    if (normalized === 'student' || normalized === 'learner') return 'Student';
    return 'Unknown';
  }

  private homeForRole(role: UserRole): string {
    if (role === 'Admin') return '/admin/dashboard';
    if (role === 'Instructor') return '/instructor/dashboard';
    if (role === 'Student') return '/student/dashboard';
    return '/home';
  }

  private safeReturnUrl(returnUrl?: string | null): string | null {
    if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) return null;
    try {
      this.router.parseUrl(returnUrl);
      return returnUrl;
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    this.tokenStore.clear();
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }
}
