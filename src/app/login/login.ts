import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Navbar } from '../shared/navbar/navbar';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  errorMsg?: string;

  constructor(private router: Router, private auth: AuthService) {}

  loginModel = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  onLoginSubmit(): void {
    this.errorMsg = undefined;
    if (this.loginModel.invalid) {
      this.loginModel.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginModel.value as { username: string; password: string };

    this.auth.login(username, password).subscribe({
      next: (session) => {
        if (session.role === 'admin') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
        const message = err?.error?.error || err?.error?.message || 'Invalid username or password';
        this.errorMsg = message;
        alert('Login Failed: ' + message);
        console.error('Login error details:', err);
      }
    });
  }
}