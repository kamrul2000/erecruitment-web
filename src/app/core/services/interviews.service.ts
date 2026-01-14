import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InterviewsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getByApplication(appId: string) {
    return this.http.get<any>(`${this.base}/api/Interviews/get-by-application/${appId}`);
  }

  createRound(payload: any) {
    return this.http.post<any>(`${this.base}/api/Interviews/createRound`, payload);
  }

  schedule(payload: any) {
    return this.http.post<any>(`${this.base}/api/Interviews/createSchedule`, payload);
  }

  cancel(interviewId: string) {
    return this.http.put<void>(`${this.base}/api/Interviews/${interviewId}/cancel`, {});
  }

  complete(interviewId: string) {
    return this.http.put<void>(`${this.base}/api/Interviews/${interviewId}/complete`, {});
  }

  submitFeedback(interviewId: string, payload: any) {
    return this.http.put<void>(`${this.base}/api/Interviews/${interviewId}/feedback`, payload);
  }
}
