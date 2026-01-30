import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokens = inject(TokenService);
  const router = inject(Router);

  const isAuthRoute =
    req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');

  let cloned = req;
  const token = tokens.get();
  if (token && !isAuthRoute) {
    cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(cloned).pipe(
    // minimal 401 handling
    (source) =>
      new Observable((observer) => {
        const subscription = source.subscribe({
          next: (value) => observer.next(value),
          error: (err: HttpErrorResponse) => {
            if (err.status === 401) {
              tokens.clear();
              router.navigateByUrl('/');
            }
            observer.error(err);
          },
          complete: () => observer.complete(),
        });
        return () => subscription.unsubscribe();
      })
  );
};
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
