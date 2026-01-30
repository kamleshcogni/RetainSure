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
  registerMode = false;
  errorMsg?: string;

  constructor(private router: Router, private auth: AuthService) {}

  registerModel = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    // BACKEND expects "contactNumber" — map in submit
    contact: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{10}$/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    tnc: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  loginModel = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  toggleMode(): void {
    this.registerMode = !this.registerMode;
    this.errorMsg = undefined;
  }

  onRegisterSubmit(): void {
  this.errorMsg = undefined;
  if (this.registerModel.invalid) {
    this.registerModel.markAllAsTouched();
    return;
  }
  
  const { name, contact, email, password } = this.registerModel.value as any;

  this.auth.register({
    fullName: name,
    email,
    password,
    contactNumber: contact
  }).subscribe({
    next: () => {
      // 1. Show success alert
      alert('Registration Successful! Please login with your credentials.');
      
      // 2. Reset the register form
      this.registerModel.reset();
      
      // 3. Switch back to Login mode
      this.toggleMode();
    },
    error: (err) => {
      // 1. Extract error message
      const message = err?.error?.error || err?.error?.message || 'Registration failed';
      
      // 2. Set property for HTML display
      this.errorMsg = message;

      // 3. Show error alert
      alert('Registration Error: ' + message);
      
      console.error('Register error details:', err);
    }
  });
}

  onLoginSubmit(): void {
    this.errorMsg = undefined;
    if (this.loginModel.invalid) {
      this.loginModel.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginModel.value as { email: string; password: string };
    console.log(email, password)
    this.auth.login(email, password).subscribe({
      next: (session) => {
        console.log(session)
        if (session.role === 'admin') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
      // 1. Extract the message
      const message = err?.error?.error || err?.error?.message || 'Invalid email or password';
      
      // 2. Set the component property (for HTML display)
      this.errorMsg = message;

      // 3. Show the browser alert
      alert('Login Failed: ' + message);
      
      console.error('Login error details:', err);
    }
    });
  }
}