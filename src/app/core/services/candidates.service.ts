import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Candidate } from '../models/api-models';

@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Candidate[]>(`${this.base}/api/Candidates`);
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
