/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

type TenantType =
  | 'DEVELOPER'
  | 'USER'
  | 'OPERATOR';

export class TenantInfo {
  ETag: any;
  allowedToCreateSubtenant: boolean;
  companyName: string;
  country?: string;
  displayName: string;
  name: string;
  prefix: string;
  type: TenantType;
}
