import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoggedOutGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn()) {
      // Route by role
      const user = this.auth.getCurrentUser();
      if (user?.role === 'admin') return this.router.createUrlTree(['/admin/dashboard']);
      if (user?.role === 'customer') return this.router.createUrlTree(['/customer/dashboard']);
    }
    return true;
  }
}