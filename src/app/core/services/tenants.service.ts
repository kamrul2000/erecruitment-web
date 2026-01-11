import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Tenant } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class TenantsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Tenant[]>(`${this.base}/api/Tenants`);
  }

  create(payload: { name: string; slug: string }) {
    return this.http.post<Tenant>(`${this.base}/api/Tenants`, payload);
  }
}
