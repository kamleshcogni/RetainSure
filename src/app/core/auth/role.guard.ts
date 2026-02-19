import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { UiRole } from './token.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const roles = route.data['roles'] as UiRole[] | undefined;
    const user = this.auth.getCurrentUser();

    // Not logged in
    if (!user) {
      return this.router.createUrlTree(['/',], { queryParams: { returnUrl: state.url } });
    }

    // Role mismatch
    if (roles && !roles.includes(user.role)) {
      return this.router.createUrlTree(['/',], { queryParams: { denied: 'role', returnUrl: state.url } });
    }

    return true;
  }
}