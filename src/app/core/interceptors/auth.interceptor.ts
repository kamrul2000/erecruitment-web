import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStorageService } from '../services/auth-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(AuthStorageService);
  const token = storage.getToken();

  // Convert URL to lowercase for safe comparison
  const url = req.url.toLowerCase();

  // ✅ Skip Authorization for public APIs
  if (url.includes('/api/public/')) {
    return next(req);
  }

  // If no token, continue without modifying request
  if (!token) {
    return next(req);
  }

  // Clone request and attach Authorization header
  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(cloned);
};
