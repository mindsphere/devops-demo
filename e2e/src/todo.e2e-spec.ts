/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { browser, by, element } from 'protractor';
import { protractor } from 'protractor/built/ptor';

describe('Todo list manipulation', () => {

  beforeEach(() => {
    browser.get('/');
  });

  it('should be able to add an element', () => {
    const taskTitle = element(by.css('input.form-control'));
    taskTitle.sendKeys('code');
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
    browser.sleep(2000);

    const firstEntry = element.all(by.css('h1.form-control')).first();
    expect(firstEntry.getText()).toContain('code');
  });

  it('should be able to delete an element', () => {
    const firstEntry = element.all(by.css('.fa.fa-trash-o.text-white')).first();
    firstEntry.click();
    expect(element.all(by.css('h1.form-control')).count()).toBe(0);
  });
});
