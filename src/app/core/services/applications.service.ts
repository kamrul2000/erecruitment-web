import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApplicationFilterQuery, JobApplication } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<JobApplication[]>(`${this.base}/api/Applications`);
  }

  getById(id: string) {
    return this.http.get<JobApplication>(`${this.base}/api/Applications/${id}`);
  }

  create(payload: any) {
    return this.http.post<JobApplication>(`${this.base}/api/Applications`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/api/Applications/${id}`);
  }

  updateStatus(id: string, payload: { status: string; notes?: string }) {
    return this.http.put<void>(`${this.base}/api/Applications/${id}/status`, payload);
  }

  history(id: string) {
    return this.http.get<any[]>(`${this.base}/api/Applications/${id}/history`);
  }

  // Global search (GET recommended; your swagger shows POST but your earlier code used GET)
  search(query: ApplicationFilterQuery) {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<any>(`${this.base}/api/Applications/search`, { params });
  }

  // Pipeline by jobId (GET recommended)
  byJob(jobId: string, query: ApplicationFilterQuery) {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<any>(`${this.base}/api/jobs/${jobId}/applications`, { params });
  }
}
