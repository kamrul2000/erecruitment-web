import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PublicCareerService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

 theme(slug: string) {
  return this.http.get<any>(`${this.base}/api/public/${slug}/theme`);
}

  jobs(slug: string) {
    return this.http.get<any[]>(`${this.base}/api/public/${slug}/jobs/get-all`);
  }

  job(slug: string, jobId: string) {
    return this.http.get<any>(`${this.base}/api/public/${slug}/jobs/${jobId}`);
  }

  apply(slug: string, jobId: string, formData: FormData) {
    return this.http.post<any>(`${this.base}/api/public/${slug}/jobs/${jobId}/apply`, formData);
  }
}
