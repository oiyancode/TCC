import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface User {
  email: string;
  password?: string; // In a real app, never store plain text passwords!
  name?: string;
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

  private getUsers(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
}
