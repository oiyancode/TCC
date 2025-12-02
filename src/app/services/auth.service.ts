import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface CreditCard {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface User {
  email: string;
  password?: string; // In a real app, never store plain text passwords!
  name?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  twoFactorEnabled?: boolean;
  savedCards?: CreditCard[];
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly STORAGE_KEY = 'enter_users';
  private readonly CURRENT_USER_KEY = 'enter_current_user';

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    const stored = localStorage.getItem(this.CURRENT_USER_KEY);
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    }
  }

  register(user: User): Observable<boolean> {
    const users = this.getUsers();
    if (users.find((u) => u.email === user.email)) {
      return of(false); // User already exists
    }
    users.push(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    return of(true);
  }

  login(credentials: User): Observable<boolean> {
    const users = this.getUsers();
    const user = users.find(
      (u) =>
        u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(safeUser));
      this.currentUserSubject.next(safeUser);
      return of(true);
    }
    return of(false);
  }

  logout() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  updateProfile(updatedUser: User): Observable<boolean> {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.email === updatedUser.email);

    if (index !== -1) {
      // Update in the list of all users
      // Keep the password if it's not provided in the update (though typically we wouldn't pass it around like this)
      // For this mock, we assume updatedUser might not have the password, so we preserve it from the existing record if needed,
      // OR we expect the caller to handle it.
      // Let's merge carefully.
      const existingUser = users[index];
      const mergedUser = { ...existingUser, ...updatedUser };
      
      // If password is being changed, it should be in updatedUser. 
      // If not, mergedUser keeps the old one.

      users[index] = mergedUser;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));

      // Update current user session
      const { password, ...safeUser } = mergedUser;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(safeUser));
      this.currentUserSubject.next(safeUser);
      
      return of(true);
    }
    return of(false);
  }

  private getUsers(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
