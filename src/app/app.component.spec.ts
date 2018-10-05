import { TestBed, async } from '@angular/core/testing';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TodosComponent } from './todos/todos.component';
import { UserInfoComponent } from './userinfo/userinfo.component';
import { TodoServiceMock } from './todo.service.mock';
import { TodoService } from './todo.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    (<any>window)._msb = { init: () => {} };
    TestBed.configureTestingModule({
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
        { provide: TodoService, useClass: TodoServiceMock }
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'todo'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('TODO');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('TODO');
  }));
});
