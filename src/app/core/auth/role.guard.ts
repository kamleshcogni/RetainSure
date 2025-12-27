import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService, Role } from "./auth.service";

@Injectable({providedIn: 'root'})
export class RoleGuard implements CanActivate{
    constructor(private auth: AuthService, private router: Router){}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const roles = route.data['roles'] as Role[] | undefined;
        const user = this.auth.getStoredUser();
        if (!user) {
            this.router.navigate(['/']);
            return false;
        }
        if (roles && !roles.includes(user.role)) {
            this.router.navigate(['/']);
            return false;
        }
        return true;
    }
}