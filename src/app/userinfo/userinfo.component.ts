/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Component, OnInit } from '@angular/core';

import { UserInfo } from '../userinfo';
import { TodoService } from '../todo.service';
import { MindSphereService } from '../mindsphere.service';
import { TenantInfo } from '../tenantinfo';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.scss']
})
export class UserInfoComponent implements OnInit {
  userInfo: UserInfo;
  tenantInfo: TenantInfo;

  constructor(
    private todoService: TodoService,
    private mindSphereService: MindSphereService) {}

  ngOnInit() {
    this.get();
  }

  get(): void {
    this.todoService.getMe()
      .subscribe(userInfo => this.userInfo = userInfo);
    this.mindSphereService.getTenantInfo()
      .subscribe(tenantInfo => this.tenantInfo = tenantInfo);
  }
}
