/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { TenantInfo } from './tenantinfo';
import { environment } from '../environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MindSphereService {

  static readonly TENANTMGMT_TENANTINFO_URL = './api/tenantmanagement/v4/tenantInfo';
  mdspXsrfTokenHeader: string;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.mdspXsrfTokenHeader = this.cookieService.get('XSRF-TOKEN');

    if (! environment.production) {
      console.log('MindSphere dev mode, setting custom xsrf header and session cookie');

      this.mdspXsrfTokenHeader = environment.mdsp.xsrfTokenHeader;
      this.cookieService.set('SESSION', environment.mdsp.sessionCookie);
    }
  }

  getTenantInfo(): Observable<TenantInfo> {
    return this.http.get<TenantInfo>(
      MindSphereService.TENANTMGMT_TENANTINFO_URL,
      {
        headers: new HttpHeaders({
          'x-xsrf-token': this.mdspXsrfTokenHeader,
          'accept': 'application/json',
          'content-type': 'application/json'
        })
      })
      .pipe(tap(response => {
        console.log('tenantInfo:', response);
      }));
  }
}
