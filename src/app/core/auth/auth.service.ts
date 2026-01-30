import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, throwError } from 'rxjs';
import { TokenService, UiRole } from './token.service';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
}

export interface SessionUser {
  email: string;
  role: UiRole; 
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  updateProfile(arg0: { name: any; email: any; }) {
    throw new Error('Method not implemented.');
  }
  private readonly base = "http://localhost:8080";

  private readonly currentUserSubject = new BehaviorSubject<SessionUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private tokens: TokenService) {
    // Rehydrate session from localStorage on app load
    const email = this.tokens.getEmail();
    const role = this.tokens.getRole();
    if (email && role) {
      this.currentUserSubject.next({ email, role });
    }
  }

  login(email: string, password: string): Observable<SessionUser> {
    const body: LoginRequest = { email, password };
    
    return this.http.post<AuthResponse>(`${this.base}/api/auth/login`, body).pipe(
      map((res) => {
        // 1. Save the token first
        this.tokens.save(res.accessToken);

        // 2. Try to extract data from the newly saved token
        const role = this.tokens.getRole();
        const userEmail = this.tokens.getEmail();

        // DEBUG: If your redirect isn't working, check these logs in the browser!
        console.log('Token saved. Extracted Role:', role);
        console.log('Token saved. Extracted Email:', userEmail);

        if (!role || !userEmail) {
          // If this happens, your TokenService isn't parsing the JWT claims correctly
          throw new Error('Login successful but Token claims (role/email) are missing.');
        }

        const session: SessionUser = { email: userEmail, role: role as UiRole };
        
        // 3. Update the app state
        this.currentUserSubject.next(session);
        
        return session;
      })
    );
  }

  register(req: RegisterRequest): Observable<any> {
  return this.http.post(`${this.base}/api/auth/register`, req);
}

  logout(): void {
    this.tokens.clear();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): SessionUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !this.tokens.isExpired();
  }
}