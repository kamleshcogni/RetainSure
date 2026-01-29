
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
 
  constructor(private router: Router, private auth: AuthService){}
  registerMode = false;

  
registerModel = new FormGroup({
  name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
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
  }

  onRegisterSubmit(): void {
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
