
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService, Role } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const roles = route.data['roles'] as Role[] | undefined;

    const user = this.auth.getCurrentUser();

    if (!user) {
      return this.router.createUrlTree(['/'], { queryParams: { returnUrl: state.url } });
    }

    if (roles && !roles.includes(user.role)) {
      return this.router.createUrlTree(['/'], { queryParams: { denied: 'role', returnUrl: state.url } });
    }

    // Allowed
    return true;
  }
}
