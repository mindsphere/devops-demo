/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    browser.sleep(5000);
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
