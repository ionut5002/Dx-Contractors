import { Component, OnInit } from '@angular/core';
import { SharedService } from 'src/app/Extras/shared.service';
import { AuthService } from '../auth.service';
import { User } from '../user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  users: User[] = [];
  currentUser: User | undefined | null  = null;

  constructor(private sharedService: SharedService, private authService: AuthService) { }

  ngOnInit(): void {
    this.sharedService.getUsers().subscribe((users: User[]) => {
      this.users = users;
      const currentUserUid = this.authService.getCurrentUserUid(); // Assuming getCurrentUserUid is a method
      if (currentUserUid) {
        this.currentUser = this.users.find(user => user.uid === currentUserUid);
      }
    });
  }
}
