import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { CertsComponent } from './certs.component';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { Certs } from 'src/app/models/certs.model';
import { BehaviorSubject } from 'rxjs';

describe('CertsComponent', () => {
  let component: CertsComponent;
  let fixture: ComponentFixture<CertsComponent>;
  let dbTaskServiceSpy: jasmine.SpyObj<DBTaskService>;

  let certsSubject: BehaviorSubject<Certs[]>;

  beforeEach(waitForAsync(() => {
    certsSubject = new BehaviorSubject<Certs[]>([]);

    dbTaskServiceSpy = jasmine.createSpyObj('DBTaskService', [
      'addCert',
      'deleteCert',
      'getCertsObservable',
      'loadCerts'
    ]);

    dbTaskServiceSpy.addCert.and.returnValue(Promise.resolve(true));
    dbTaskServiceSpy.deleteCert.and.returnValue(Promise.resolve(true));
    dbTaskServiceSpy.getCertsObservable.and.returnValue(certsSubject.asObservable());
    dbTaskServiceSpy.loadCerts.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        IonicModule.forRoot(),
        FormsModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: DBTaskService, useValue: dbTaskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('debería ser creado', () => {
    expect(component).toBeTruthy();
  });

  it('onToggleExpirationChange debería actualizar hasExpiration y limpiar expirationDate', () => {
    component.certData.expirationDate = new Date();
    component.onToggleExpirationChange({ checked: false } as MatSlideToggleChange);
    expect(component.hasExpiration).toBeFalse();
    expect(component.certData.expirationDate).toBeNull();
  });

  it('onSubmit debería llamar a addCert si el formulario es válido', async () => {
    component.certData = {
      name: 'Nuevo Cert',
      acquiredDate: new Date('2022-01-01'),
      expirationDate: null
    };

    const mockForm = { valid: true, controls: {} } as NgForm;
    spyOn(component, 'resetForm');

    await component.onSubmit(mockForm);

    expect(dbTaskServiceSpy.addCert).toHaveBeenCalled();
    expect(component.resetForm).toHaveBeenCalled();
  });

  it('onSubmit no debería llamar a addCert si el formulario es inválido', async () => {
    component.certData = {
      name: '',
      acquiredDate: null,
      expirationDate: null
    };
    const mockForm = { valid: false, controls: { name: { markAsTouched: () => {} } } } as unknown as NgForm;

    await component.onSubmit(mockForm);

    expect(dbTaskServiceSpy.addCert).not.toHaveBeenCalled();
  });
});