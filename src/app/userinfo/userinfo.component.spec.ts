/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { UserInfoComponent } from './userinfo.component';
import { TodoServiceMock } from '../todo.service.mock';
import { TodoService } from '../todo.service';
import { MindSphereService } from '../mindsphere.service';
import { MindSphereServiceMock } from '../mindsphere.service.mock';

describe('UserInfoComponent', () => {
  let component: UserInfoComponent;
  let fixture: ComponentFixture<UserInfoComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ UserInfoComponent ],
      providers: [ TodoService,
        { provide: TodoService, useClass: TodoServiceMock },
        { provide: MindSphereService, useClass: MindSphereServiceMock },
        CookieService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should have userinfo element from mock`, async(() => {
    fixture = TestBed.createComponent(UserInfoComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('div')[0].textContent).toContain('john.doe@example.com');
  }));

  it(`should have tenantinfo element from mock`, async(() => {
    fixture = TestBed.createComponent(UserInfoComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('div')[1].textContent).toContain('mytenant');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
