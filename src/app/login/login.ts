
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  /**
   * Controls which form is visible.
   * true  => Register
   * false => Login
   */
  @Input() registerMode = false;

  // Simple demo models. Replace with your FormGroup or API bindings.
  registerModel = {
    name: '',
    contact: '',
    email: '',
    password: '',
    tnc: true,
  };

  loginModel = {
    email: '',
    password: '',
  };

  toggleMode(): void {
    this.registerMode = !this.registerMode;
  }

  onRegisterSubmit(): void {
    // TODO: integrate with your API
    console.log('Register submit', this.registerModel);
  }

  onLoginSubmit(): void {
       // TODO: integrate with your API
    console.log('Login submit', this.loginModel);
  }
}
