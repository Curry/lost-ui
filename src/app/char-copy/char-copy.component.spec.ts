import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharCopyComponent } from './char-copy.component';

describe('CharCopyComponent', () => {
  let component: CharCopyComponent;
  let fixture: ComponentFixture<CharCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CharCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
