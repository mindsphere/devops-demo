/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { TodosComponent } from './todos.component';
import { TodoServiceMock } from '../todo.service.mock';
import { TodoService } from '../todo.service';

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ TodosComponent ],
      providers: [ TodoService,
        { provide: TodoService, useClass: TodoServiceMock }
      ],
    schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(`should have todo elements from mock`, async(() => {
    fixture = TestBed.createComponent(TodosComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('h1')[0].textContent).toContain('code');
    expect(compiled.querySelectorAll('h1')[1].textContent).toContain('build');
    expect(compiled.querySelectorAll('h1')[2].textContent).toContain('test');
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
