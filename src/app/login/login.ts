
import { Component, Input } from '@angular/core';
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
  styleUrl: './login.css'
})
export class Login {
  /**
   * Controls which form is visible.
   * true  => Register
   * false => Login
   */
  constructor(private router: Router, private auth: AuthService){}
  @Input() registerMode = false;

  // Simple demo models. Replace with your FormGroup or API bindings.
  registerModel = new FormGroup( {
    name: new FormControl(''),
    contact: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    tnc: new FormControl(false, [Validators.requiredTrue]),
  });

  loginModel = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  toggleMode(): void {
    this.registerMode = !this.registerMode;
  }

  onRegisterSubmit(): void {
    // TODO: integrate with your API
    console.log('Register submit', this.registerModel);
  }

  onLoginSubmit(): void {
    if(this.loginModel.invalid){
      this.loginModel.markAllAsTouched();
      return;
    }
    const {email, password} = this.loginModel.value as {email: string, password: string}
    const user = this.auth.login(email, password);
    if(!user) {
      alert('Invalid username or password');
      return;
    }
    if(user.role === 'admin'){
      this.router.navigate(['/admin/dashboard']);
    }
    if(user.role === 'customer'){
      this.router.navigate(['/customer/dashboard']);
    }
    console.log('Login submit', this.loginModel);
  }
}
