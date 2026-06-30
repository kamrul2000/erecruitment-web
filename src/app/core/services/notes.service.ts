import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getByApplication(appId: string) {
    return this.http.get<any[]>(`${this.base}/api/ApplicationNotes/get-by-application/${appId}`);
  }

  create(payload: any) {
    return this.http.post<any>(`${this.base}/api/ApplicationNotes`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/api/ApplicationNotes/${id}`);
  }
}
