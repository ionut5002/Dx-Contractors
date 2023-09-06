import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  error: unknown;
  hide = true;

  constructor(private authService: AuthService) {}

  async login() {
    try {
      await this.authService.signIn(this.email, this.password);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        this.error = error.message
      }
    }
  }
}
