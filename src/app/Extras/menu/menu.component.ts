import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/Auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  isSidebarOpened = true;
  isMobile = false;
  isLoggedIn = false;
  loginSubscription?: Subscription;

  constructor(public auth: AuthService) { }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loginSubscription = this.auth.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
    });
  }

  ngOnDestroy(): void {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarOpened = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpened = !this.isSidebarOpened;
  }
}
