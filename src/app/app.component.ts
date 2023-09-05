import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './Auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'DX-Contractors';
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.getLoggedInUser().then(isLoggedIn => {
      if (isLoggedIn) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
