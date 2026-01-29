
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoggedOutGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const isLoggedIn = this.auth.isLoggedIn();

    if (!isLoggedIn) {
      return true;
    }

    const user = this.auth.getCurrentUser();
    const target =
      user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

    return this.router.createUrlTree([target]);
  }
}
