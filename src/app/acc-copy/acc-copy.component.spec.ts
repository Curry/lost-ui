import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccCopyComponent } from './acc-copy.component';

describe('AccCopyComponent', () => {
  let component: AccCopyComponent;
  let fixture: ComponentFixture<AccCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
