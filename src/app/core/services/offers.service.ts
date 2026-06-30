import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OffersService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getByApplication(appId: string) {
    return this.http.get<any[]>(`${this.base}/api/Offers/get-by-application/${appId}`);
  }

  create(payload: any) {
    return this.http.post<any>(`${this.base}/api/Offers`, payload);
  }

  update(id: string, payload: any) {
    return this.http.put<void>(`${this.base}/api/Offers/${id}`, payload);
  }

  send(id: string) {
    return this.http.put<void>(`${this.base}/api/Offers/${id}/send`, {});
  }

  accept(id: string, payload: any = {}) {
    return this.http.put<void>(`${this.base}/api/Offers/${id}/accept`, payload);
  }

  decline(id: string, payload: any = {}) {
    return this.http.put<void>(`${this.base}/api/Offers/${id}/decline`, payload);
  }

  withdraw(id: string) {
    return this.http.put<void>(`${this.base}/api/Offers/${id}/withdraw`, {});
  }
}
