import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStorageService } from '../services/auth-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(AuthStorageService);
  const router = inject(Router);
  const token = storage.getToken();

  const url = req.url.toLowerCase();
  const isPublic = url.includes('/api/public/');
  const isLogin = url.includes('/api/auth/login') || url.includes('/api/auth/superadmin/login');

  const outgoing = token && !isPublic
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 on a non-login request: token is missing/expired/invalid.
      // Clear stale state and bounce to login. Skip on the login call itself
      // so the form can show "invalid credentials" instead of redirecting.
      if (err.status === 401 && !isLogin && !isPublic) {
        storage.clear();
        const isSuperAdminPath = router.url.startsWith('/saas');
        router.navigate([isSuperAdminPath ? '/saas/login' : '/login']);
      }
      return throwError(() => err);
    })
  );
};
