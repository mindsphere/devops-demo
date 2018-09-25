/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { browser, by, element } from 'protractor';

describe('MindSphere OS Bar', () => {

  it('should have the poweredByMindSphere image', () => {
    browser.get('/');
    expect(element(by.css('img.poweredByMindSphere')).isElementPresent);
  });
});
