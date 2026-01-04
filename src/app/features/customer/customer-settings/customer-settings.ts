
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../../core/auth/auth.service';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-customer-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  templateUrl: './customer-settings.html',
  styleUrls: ['./customer-settings.css'], // ✅ plural
})
export class CustomerSettings implements OnInit {
  saved = signal(false);
  currentUser: User | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // Initialize after DI
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    });
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => {
      this.currentUser = u;
      if (u) {
        this.form.patchValue({
          name: u.name ?? '',
          email: u.email ?? '',
        });
      }
    });
  }

  /** Helper so template can safely access controls with strict type checking */
  ctrl(path: string) {
    return this.form.get(path);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.updateProfile({
      name: this.form.value.name ?? '',
      email: this.form.value.email ?? '',
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  cancel(): void {
    const u = this.auth.getCurrentUser();
    if (u) {
      this.form.patchValue({
        name: u.name ?? '',
        email: u.email ?? '',
      });
    } else {
      this.form.reset();
    }
  }

  goBack(): void {
    this.router.navigate(['/customer/dashboard']);
  }
}
