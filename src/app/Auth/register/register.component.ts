import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  error: unknown;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['Manager']
    }, { validators: this.checkPasswords });
  }

  ngOnInit(): void {
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  async register() {
    if (this.registerForm.valid) {
      const { email, password, role, name } = this.registerForm.value;
      try {
        await this.authService.signUp(email, password, role, name);
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
          this.error = error.message;
        }
      }
    } else {
      this.error = 'Please fill in all fields correctly.';
    }
  }
}
