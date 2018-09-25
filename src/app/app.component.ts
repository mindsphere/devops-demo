/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Component } from '@angular/core';
declare let _msb: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'TODO';
  slogan = 'a minimal todo list';

  constructor() {
    _msb.init({
      title: `${this.title}, ${this.slogan}`,
      initialize: true
    });
  }
}
