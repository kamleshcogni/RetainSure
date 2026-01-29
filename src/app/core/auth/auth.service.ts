
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, map, distinctUntilChanged } from 'rxjs';

export type Role = 'admin' | 'customer';

export interface User {
  email: string;
  password: string;
  role: Role;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly STORAGE_KEY = 'auth_user';

  /** Mock users (hardcoded) */
  private readonly users: User[] = [
    { email: 'kamlesh@example.com', password: 'password', role: 'admin',    name: 'Kamlesh' },
    { email: 'logesh@example.com',  password: 'password', role: 'admin',    name: 'Logesh'  },
    { email: 'hari@example.com',    password: 'password', role: 'customer', name: 'Hari'    },
    { email: 'sejal@example.com',   password: 'password', role: 'customer', name: 'Sejal'   },
    { email: 'sruthi@example.com',  password: 'password', role: 'customer', name: 'Sruthi'  },
    { email: 'shree@example.com',   password: 'password', role: 'customer', name: 'Shree'   },
  ];

  private readonly isBrowser: boolean;

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isLoggedIn$ = this.currentUser$.pipe(
    map(u => !!u),
    distinctUntilChanged()
  );

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = this.readStoredUser();
      if (stored) {
        this.currentUserSubject.next(stored);
      }
    }
  }


  login(email: string, password: string): User | null {
    const user = this.users.find(u => u.email === email && u.password === password) ?? null;
    if (user) {
      this.persistUser(user);         
      this.currentUserSubject.next(user);
    }
    return user;
  }

  logout(): void {
    this.clearStoredUser();           
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(roles: Role[]): boolean {
    const u = this.currentUserSubject.value;
    return !!u && roles.includes(u.role);
  }

  updateProfile(patch: Partial<Pick<User, 'name' | 'email'>>): void {
    const u = this.currentUserSubject.value;
    if (!u) return;
    const updated: User = { ...u, ...patch };
    this.persistUser(updated);
    this.currentUserSubject.next(updated);
  }

  setUser(user: User | null): void {
    if (user) {
      this.persistUser(user);
      this.currentUserSubject.next(user);
    } else {
      this.logout();
    }
  }


  private readStoredUser(): User | null {
    if (!this.isBrowser) return null;
    try {
      const raw = globalThis?.localStorage?.getItem(AuthService.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      this.clearStoredUser();
      return null;
    }
  }

  private persistUser(user: User): void {
    if (!this.isBrowser) return;
    try {
      if (typeof globalThis?.localStorage?.setItem === 'function') {
        globalThis.localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(user));
      }
    } catch {
      
    }
  }

  private clearStoredUser(): void {
    if (!this.isBrowser) return; 
    try {
      if (typeof globalThis?.localStorage?.removeItem === 'function') {
        globalThis.localStorage.removeItem(AuthService.STORAGE_KEY);
      }
    } catch {
     
    }
  }

  getStoredUser(): User | null {
    return this.readStoredUser();
  }
}
