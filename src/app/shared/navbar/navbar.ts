
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService, User } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  isOnSettingsPage = false;
  private navSub?: Subscription;

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Initialize based on current URL
    this.isOnSettingsPage = this.router.url.startsWith('/customer/settings');

    // Update on route changes
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
    this.router.navigate(['/customer']); // adjust if your dashboard route differs
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']); // back to landing
  }

  avatarInitials(user: User | null): string {
    const name = user?.name ?? '';
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
    return initials || (user?.email?.[0]?.toUpperCase() ?? '');
  }
}
