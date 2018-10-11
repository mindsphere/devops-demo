/*
Copyright Siemens AG 2018
SPDX-License-Identifier: MIT
*/

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TodosComponent } from './todos/todos.component';
import { UserInfoComponent } from './userinfo/userinfo.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  declarations: [
    AppComponent,
    TodosComponent,
    UserInfoComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
