import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const TOKEN_KEY = 'accessToken';

// UI roles you already use in route data
export type UiRole = 'admin' | 'customer';

export function mapApiRoleToUi(role?: string): UiRole | null {
  if (role === 'ROLE_ADMIN') return 'admin';
  if (role === 'ROLE_CUSTOMER') return 'customer';
  return null;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Check that a *real* localStorage is available (browser), not a Node stub */
  private hasLocalStorage(): boolean {
    if (!this.isBrowser) return false;
    try {
      const ls: any = globalThis?.localStorage;
      return (
        typeof ls !== 'undefined' &&
        typeof ls.getItem === 'function' &&
        typeof ls.setItem === 'function' &&
        typeof ls.removeItem === 'function'
      );
    } catch {
      return false;
    }
  }

  save(token: string) {
    if (this.hasLocalStorage()) {
      globalThis.localStorage.setItem(TOKEN_KEY, token);
    }
  }

  get(): string | null {
    if (!this.hasLocalStorage()) return null;
    try {
      return globalThis.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  clear() {
    if (this.hasLocalStorage()) {
      try { globalThis.localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    }
  }

  isExpired(): boolean {
    const token = this.get();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload?.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getRole(): UiRole | null {
    const token = this.get();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log(payload)
      return mapApiRoleToUi(payload?.role);
    } catch {
      return null;
    }
  }

  getEmail(): string | null {
    const token = this.get();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub ?? null;
    } catch {
      return null;
    }
  }
}
