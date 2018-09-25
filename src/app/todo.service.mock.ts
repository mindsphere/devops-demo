/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { Injectable } from '@angular/core';
import { Observable , of} from 'rxjs';
import { Todo } from './todo';

@Injectable()
export class TodoServiceMock {

  getTodos (): Observable<Todo[]> {
    const TODOS: Todo[] = [
      { _id: '5b839ff6601f82e43f24da01' , title: 'code' },
      { _id: '5b839ff7601f82e43f24da02' , title: 'build' },
      { _id: '5b839ff9601f82e43f24da03' , title: 'test' }
    ];
    return of(TODOS);
  }

  addTodo (todo: Todo): Observable<String> {
    return of('OK');
  }

  deleteTodo (todo: Todo): Observable<String> {
    return of('OK');
  }
}
