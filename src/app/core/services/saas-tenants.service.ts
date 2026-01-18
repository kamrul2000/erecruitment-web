import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SaasTenantsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<any[]>(`${this.base}/api/Tenants`);
  }

  createWithAdmin(payload: any) {
    return this.http.post<any>(`${this.base}/api/Tenants/create-with-admin`, payload);
  }

  disable(id: string) {
    return this.http.put<void>(`${this.base}/api/Tenants/${id}/disable`, {});
  }

  enable(id: string) {
    return this.http.put<void>(`${this.base}/api/Tenants/${id}/enable`, {});
  }
}
