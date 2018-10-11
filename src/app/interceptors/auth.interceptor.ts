/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import {Inject, Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest, HttpErrorResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor (@Inject(DOCUMENT) private document: any) {}

  intercept (req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((err: any) => {
        // If we detect a 401 Unauthorized on any request (including xhr),
        // redirect to the login page managed by the MindSphere Gateway
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.document.location.href = '/login';
        }
      })
    );
  }
}
