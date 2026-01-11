import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(`${this.base}/api/Users`);
  }

  getById(id: string) {
    return this.http.get<any>(`${this.base}/api/Users/${id}`);
  }

  create(payload: any) {
    return this.http.post<any>(`${this.base}/api/Users`, payload);
  }

  update(id: string, payload: any) {
    return this.http.put<void>(`${this.base}/api/Users/${id}`, payload);
  }

  resetPassword(id: string, newPassword: string) {
    return this.http.put<void>(`${this.base}/api/Users/${id}/reset-password`, { newPassword });
  }

  toggleActive(id: string) {
    return this.http.put<void>(`${this.base}/api/Users/${id}/toggle-active`, {});
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/api/Users/${id}`);
  }
}
