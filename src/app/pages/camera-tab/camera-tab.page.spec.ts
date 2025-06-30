import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CameraTabPage } from './camera-tab.page';

describe('CameraTabPage', () => {
  let component: CameraTabPage;
  let fixture: ComponentFixture<CameraTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
