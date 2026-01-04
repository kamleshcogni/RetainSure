
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, Role } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Guard routes based on login status and optional allowed roles.
   *
   * Usage:
   * {
   *   path: 'customer/settings',
   *   canActivate: [RoleGuard],
   *   data: { roles: ['customer', 'admin'] as Role[] }
   * }
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const roles = route.data['roles'] as Role[] | undefined;

    // Prefer reading from the current user BehaviorSubject (no re-parsing localStorage)
    const user = this.auth.getCurrentUser();

    // Not logged in: navigate to landing (preserve intended URL)
    if (!user) {
      return this.router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } });
    }

    // Logged in but no role match: redirect (optional: different page if you have one)
    if (roles && !roles.includes(user.role)) {
      return this.router.createUrlTree(['/'], { queryParams: { denied: 'role', returnUrl: state.url } });
    }

    // Allowed
    return true;
  }
}
