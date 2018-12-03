/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Injectable } from '@angular/core';
import { Observable , of} from 'rxjs';
import { TenantInfo } from './tenantinfo';

@Injectable()
export class MindSphereServiceMock {

  getTenantInfo(): Observable<TenantInfo> {
    const TENANT_INFO: TenantInfo = {
      prefix: 'mytenant',
      name: 'mytenant',
      displayName: 'mytenant',
      type: 'DEVELOPER',
      companyName: 'My Company',
      allowedToCreateSubtenant: true,
      ETag: 1
    };
    return of(TENANT_INFO);
  }
}
