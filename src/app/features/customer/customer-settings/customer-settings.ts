import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, SessionUser } from '../../../core/auth/auth.service';
import { Navbar } from '../../../shared/navbar/navbar';

@Component({
  selector: 'app-customer-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  templateUrl: './customer-settings.html',
  styleUrls: ['./customer-settings.css'],
})
export class CustomerSettings implements OnInit {
  saved = signal(false);
  currentUser: SessionUser | null = null;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
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

  ctrl(path: string) {
    return this.form.get(path);
  }

  save(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  
  // Now we subscribe to trigger the HTTP call
  this.auth.updateProfile(this.form.value).subscribe({
    next: () => {
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    },
    error: (err) => console.error('Update failed', err)
  });
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