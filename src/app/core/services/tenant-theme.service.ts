import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TenantThemeService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getTheme() {
    return this.http.get<any>(`${this.base}/api/TenantSettings/theme`);
  }

  updateTheme(payload: any) {
    return this.http.put<any>(`${this.base}/api/TenantSettings/theme`, payload);
  }

  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.base}/api/TenantSettings/theme/logo`, formData);
  }
}
