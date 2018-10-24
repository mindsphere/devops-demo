/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor (@Inject(DOCUMENT) private document: any) {}

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err, caught) => {
        // If we detect a 401 Unauthorized on any request (including xhr),
        // redirect to the login page managed by the MindSphere Gateway
        // This can also happen on failed CORS requests, and Angular sees
        // status code 0
        //
        // Also remove the xsrf-token cookie before redirecting, or the
        // preflight OPTIONS request triggered by the browser via CORS will fail
        // at mdsp due to the extra added x-xsrf-token header added by angular
        if (err instanceof HttpErrorResponse && [0, 401].includes(err.status)) {
          console.log('Detected potential CORS or authentication issue');
          console.log('Invalidating XSRF-TOKEN cookie and redirecting to /login');

          this.document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
          this.document.location.href = '/login';
          return EMPTY;
        }
        return throwError(err);
      })
    );
  }
}
