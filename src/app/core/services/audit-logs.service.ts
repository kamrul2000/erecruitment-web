import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type SearchResult = { total: number; page: number; pageSize: number; items: any[] };

@Injectable({ providedIn: 'root' })
export class AuditLogsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  search(query: any) {
    return this.http.post<SearchResult>(`${this.base}/api/AuditLogs/search`, query);
  }

  getById(id: string) {
    return this.http.get<any>(`${this.base}/api/AuditLogs/${id}`);
  }
}
