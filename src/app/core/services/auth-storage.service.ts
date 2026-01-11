import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  private readonly tokenKey = 'accessToken';
  private readonly userKey = 'user';

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  clear() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  setUser(user: any) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
  getUser<T = any>(): T | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as T) : null;
  }
}
