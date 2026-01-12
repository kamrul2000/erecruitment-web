import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  get() {
    return this.http.get<any>(`${this.base}/api/Settings/get-all`);
  }

  update(payload: any) {
    return this.http.put<void>(`${this.base}/api/Settings/update`, payload);
  }

  createStage(payload: any) {
    return this.http.post(`${this.base}/api/Settings/pipeline-stages/createStage`, payload);
  }

  updateStage(id: string, payload: any) {
    return this.http.put<void>(`${this.base}/api/Settings/pipeline-stages/updateStage/${id}`, payload);
  }

  toggleStage(id: string) {
    return this.http.put<void>(`${this.base}/api/Settings/pipeline-stages/updateToggleStage/${id}/toggle`, {});
  }

  upsertTemplate(payload: any) {
    return this.http.put<void>(`${this.base}/api/Settings/email-templates/updateEmailTemplates`, payload);
  }
}
