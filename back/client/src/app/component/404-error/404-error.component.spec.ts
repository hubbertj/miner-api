import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { 404ErrorComponent } from './404-error.component';

describe('404ErrorComponent', () => {
  let component: 404ErrorComponent;
  let fixture: ComponentFixture<404ErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 404ErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(404ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
