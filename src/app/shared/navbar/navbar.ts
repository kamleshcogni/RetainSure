import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, SessionUser } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit, OnDestroy {
  isOnSettingsPage = false;
  private navSub?: Subscription;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isOnSettingsPage = this.router.url.startsWith('/customer/settings');

    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isOnSettingsPage = e.urlAfterRedirects.startsWith('/customer/settings');
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  goSettings() {
    this.router.navigate(['/customer/settings']);
  }

  goDashboard() {
    this.router.navigate(['/customer/dashboard']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  avatarInitials(user: SessionUser | null): string {
    const name = user?.name ?? '';
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((p: string) => p[0]?.toUpperCase() ?? '').join('');
    return initials || (user?.email?.[0]?.toUpperCase() ?? '');
  }
}