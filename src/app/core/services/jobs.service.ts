import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JobPosting } from '../models/api-models';
import { PagedResult } from './candidates.service';

export interface JobStats {
  total: number;
  published: number;
  draft: number;
  closed: number;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  // Server-side paginated + searchable. Returns { total, page, pageSize, items }.
  getAll(page = 1, pageSize = 20, search = '') {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<JobPosting>>(`${this.base}/api/Jobs`, { params });
  }

  // Lightweight status breakdown for the dashboard.
  stats() {
    return this.http.get<JobStats>(`${this.base}/api/Jobs/stats`);
  }

  getById(id: string) {
    return this.http.get<JobPosting>(`${this.base}/api/Jobs/${id}`);
  }

  create(payload: any) {
    return this.http.post<JobPosting>(`${this.base}/api/Jobs`, payload);
  }

  update(id: string, payload: any) {
    return this.http.put<void>(`${this.base}/api/Jobs/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/api/Jobs/${id}`);
  }
}
