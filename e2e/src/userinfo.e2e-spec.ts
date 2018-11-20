/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { browser, by, element } from 'protractor';

describe('UserInfo display', () => {

  beforeEach(() => {
    browser.get('/');
  });

  it('should show the user data', () => {
    const firstEntry = element.all(by.css('app-userinfo')).first();
    expect(firstEntry.getText()).toContain('john.doe@example.com');
  });

});
