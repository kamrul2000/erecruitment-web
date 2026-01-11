import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JobPosting } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<JobPosting[]>(`${this.base}/api/Jobs`);
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
