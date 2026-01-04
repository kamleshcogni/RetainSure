
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service'; // ✅ adjust path if needed

@Component({
  selector: 'app-sidebar',
  standalone: true,              // ✅ keep if using standalone components
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.auth.logout();          // clears current user + localStorage (browser-safe)
    this.router.navigate(['/']); // redirect to landing/home; change if needed (e.g., '/login')
  }
}
