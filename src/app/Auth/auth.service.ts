import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, collection, addDoc, collectionData, query, where } from '@angular/fire/firestore';
import { User } from './user';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInStatus = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.auth = inject(Auth);
    this.firestore = inject(Firestore);
  }

  private auth: Auth;
  private firestore: Firestore;

  get isLoggedIn(): Observable<boolean> {
    return this.loggedInStatus.asObservable();
  }

  private setLoggedIn(value: boolean): void {
    this.loggedInStatus.next(value);
  }

  async signUp(email: string, password: string, role: string, name: string) {
    email = email.toLowerCase();
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user: User = {
      displayName: name,
      uid: credential.user.uid,
      email: credential.user.email,
      role: role
    };
    await addDoc(collection(this.firestore, 'users'), user);
    this.router.navigate(['/']);
  }

  signIn(email: string, password: string): Promise<void> {
    email = email.toLowerCase();
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        this.setLoggedIn(true);
        this.router.navigate(['/']);
      })
      .catch((error) => {
        console.error("Error signing in:", error);
        throw error;
      });
  }

  async signOut() {
    try {
      await signOut(this.auth);
      this.setLoggedIn(false);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  }

  getLoggedInUser(): Promise<boolean> {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          this.setLoggedIn(true);
          resolve(true);
        } else {
          this.setLoggedIn(false);
          resolve(false);
        }
      });
    });
  }

  getCurrentUser(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUserUid(): any {
    return this.auth.currentUser?.uid;
  }

  getUsers(): Observable<User[]> {
    return collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<User[]>;
  }

  getUser(): Observable<User[]> {
    const uid = this.getCurrentUserUid();
    if (!uid) {
      // Handle the case where the UID is not available
      return of([]); // of is imported from 'rxjs'
    }
    
    const userQuery = query(
      collection(this.firestore, 'users'),
      where('uid', '==', uid)
    );
  
    return collectionData(userQuery, { idField: 'id' }) as Observable<User[]>;
  }
  
}
