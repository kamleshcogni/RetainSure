import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { TokenService, UiRole } from './token.service';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SessionUser {
  email: string;
  role: UiRole;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}`;
  private readonly currentUserSubject = new BehaviorSubject<SessionUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokens: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.rehydrateSession();
    }
  }

  private rehydrateSession(): void {
    const email = this.tokens.getEmail();
    const role = this.tokens.getRole();
    const name = localStorage.getItem('user_name') || '';

    console.log('[AuthService] rehydrateSession email=', email, 'role=', role);

    if (email && role) {
      this.currentUserSubject.next({ email, role: role as UiRole, name });
    }
  }

  /**
   * Used by guards/components in your app.
   */
  getCurrentUser(): SessionUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Used by Customer Settings page.
   */
  updateProfile(profileData: { name: string; email: string }): Observable<SessionUser> {
    return this.http.put<SessionUser>(`${this.base}/api/users/profile`, profileData).pipe(
      tap((updatedUser) => {
        const currentSession = this.currentUserSubject.value;
        if (currentSession) {
          const newSession: SessionUser = {
            ...currentSession,
            name: updatedUser.name,
            email: updatedUser.email
          };

          this.currentUserSubject.next(newSession);

          if (isPlatformBrowser(this.platformId) && updatedUser.name) {
            localStorage.setItem('user_name', updatedUser.name);
          }
        }
      })
    );
  }

  login(username: string, password: string): Observable<SessionUser> {
    const body: LoginRequest = { username, password };
    console.log('[AuthService] login() calling', `${this.base}/api/auth/login`, 'as', username);

    return this.http.post<AuthResponse>(`${this.base}/api/auth/login`, body).pipe(
      tap((res) => {
        console.log('[AuthService] login response:', {
          hasToken: !!res?.token,
          role: res?.role,
          userId: res?.userId,
        });

        this.tokens.save(res.token);
        this.tokens.saveUserId(res.userId);
        
        // Store role explicitly if TokenService supports it (optional but recommended)
        const anyTokens = this.tokens as unknown as { saveRole?: (role: string) => void };
        anyTokens.saveRole?.(res.role);

        console.log('[AuthService] TokenService.get() after save present=', !!this.tokens.get());
      }),
      map((res) => {
        // Prefer TokenService parsing; fallback to response.role
        const role = (this.tokens.getRole() ?? res.role) as UiRole;
        const userEmail = this.tokens.getEmail() ?? username;

        if (!role || !userEmail) {
          throw new Error('Login successful but role/email missing (TokenService parsing mismatch).');
        }

        const session: SessionUser = {
          email: userEmail,
          role,
          name: isPlatformBrowser(this.platformId)
            ? (localStorage.getItem('user_name') || '')
            : ''
        };

        console.log('[AuthService] session established:', session);

        this.currentUserSubject.next(session);
        return session;
      })
    );
  }

  logout(): void {
    console.log('[AuthService] logout()');
    this.tokens.clear();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user_name');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserSubject.value;
    const expired = this.tokens.isExpired();
    console.log('[AuthService] isLoggedIn userPresent=', !!user, 'tokenExpired=', expired);
    return !!user && !expired;
  }
}