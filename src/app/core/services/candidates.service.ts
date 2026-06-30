import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Candidate } from '../models/api-models';

export interface PagedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  // Server-side paginated + searchable. Returns { total, page, pageSize, items }.
  getAll(page = 1, pageSize = 20, search = '') {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.http.get<PagedResult<Candidate>>(`${this.base}/api/Candidates`, { params });
  }

  // Fetches a candidate's CV from the authenticated, tenant-scoped endpoint.
  viewResume(candidateId: string) {
    return this.http.get(`${this.base}/api/Candidates/${candidateId}/resume/file`, {
      responseType: 'blob'
    });
  }

  getById(id: string) {
    return this.http.get<Candidate>(`${this.base}/api/Candidates/${id}`);
  }

  create(payload: any) {
    return this.http.post<Candidate>(`${this.base}/api/Candidates`, payload);
  }

  update(id: string, payload: any) {
    return this.http.put<void>(`${this.base}/api/Candidates/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/api/Candidates/${id}`);
  }

  uploadResume(candidateId: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.base}/api/Candidates/${candidateId}/resume`, form);
  }
}
