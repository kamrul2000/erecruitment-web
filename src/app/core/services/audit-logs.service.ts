import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuditLogsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  search(query: any) {
    let params = new HttpParams();
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      params = params.set(k, String(v));
    });
    return this.http.get<any>(`${this.base}/api/AuditLogs`, { params });
  }

  getById(id: string) {
    return this.http.get<any>(`${this.base}/api/AuditLogs/${id}`);
  }
}
