import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/api-models';
import { tap } from 'rxjs/operators';
import { AuthStorageService } from './auth-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private storage: AuthStorageService) {}

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.base}/api/Auth/login`, payload).pipe(
      tap(res => {
        this.storage.setToken(res.accessToken);
        this.storage.setUser(res.user);
      })
    );
  }

  logout() {
    this.storage.clear();
  }

  getCurrentUser() {
    return this.storage.getUser();
  }

  isLoggedIn(): boolean {
    const token = this.storage.getToken();
    if (!token) return false;

    // Validate JWT exp claim. If missing or expired, drop the stale token.
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expSeconds = payload?.exp;
      if (typeof expSeconds === 'number' && expSeconds * 1000 > Date.now()) {
        return true;
      }
    } catch {
      // malformed token — fall through to clear
    }
    this.storage.clear();
    return false;
  }
  superAdminLogin(payload: { email: string; password: string }) {
  return this.http.post<any>(`${this.base}/api/Auth/superadmin/login`, payload).pipe(
    tap(res => {
      this.storage.setToken(res.accessToken);
      this.storage.setUser(res.user);
    })
  );
}

}
