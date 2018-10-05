/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Component, OnInit } from '@angular/core';

import { UserInfo } from '../userinfo';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html'
})
export class UserInfoComponent implements OnInit {
  userInfo: UserInfo;

  constructor(private todoService: TodoService) { }

  ngOnInit() {
    this.get();
  }

  get(): void {
    this.todoService.getMe()
      .subscribe(userInfo => this.userInfo = userInfo);
  }
}
