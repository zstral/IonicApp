import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupExtendedPage } from './signup-extended.page';

describe('SignupExtendedPage', () => {
  let component: SignupExtendedPage;
  let fixture: ComponentFixture<SignupExtendedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupExtendedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
