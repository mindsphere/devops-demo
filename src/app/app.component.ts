/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Component } from '@angular/core';
declare let _mdsp: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'TODO';
  slogan = 'a minimal todo list';

  constructor() {
    _mdsp.init({
      title: 'DevOps Demo',
      appId: '_mdspcontent',
      initialize: true,
      appInfoPath: '/assets/mdsp-app-info.json'
    });
  }
}
