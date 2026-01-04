
// src/app/core/auth/logged-out.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoggedOutGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const isLoggedIn = this.auth.isLoggedIn();

    if (!isLoggedIn) {
      // ✅ Logged-out users can access landing/login normally
      return true;
    }

    // ✅ Logged-in users go to their dashboard (choose per role)
    const user = this.auth.getCurrentUser();
    const target =
      user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

    return this.router.createUrlTree([target]);
  }
}
