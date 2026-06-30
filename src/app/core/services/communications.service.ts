import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommunicationsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getByApplication(appId: string) {
    return this.http.get<any[]>(`${this.base}/api/Communications/get-by-application/${appId}`);
  }

  send(payload: { jobApplicationId: string; subject: string; body: string }) {
    return this.http.post<any>(`${this.base}/api/Communications/send`, payload);
  }
}
