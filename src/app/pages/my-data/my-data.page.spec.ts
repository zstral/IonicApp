import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyDataPage } from './my-data.page';

describe('MyDataPage', () => {
  let component: MyDataPage;
  let fixture: ComponentFixture<MyDataPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyDataPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
