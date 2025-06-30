import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapTabPage } from './map-tab.page';

describe('MapTabPage', () => {
  let component: MapTabPage;
  let fixture: ComponentFixture<MapTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
