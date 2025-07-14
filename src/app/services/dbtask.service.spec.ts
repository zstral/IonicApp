import { TestBed } from '@angular/core/testing';
import { Platform, ToastController } from '@ionic/angular';
import { DBTaskService } from './dbtask.service';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { Experience } from '../models/exp.model';
import 'jasmine';

const mockSQLiteObject = jasmine.createSpyObj('SQLiteObject', ['executeSql']);

const mockSQLite = jasmine.createSpyObj('SQLite', ['create']);
mockSQLite.create.and.returnValue(Promise.resolve(mockSQLiteObject));

describe('DBTaskService', () => {
  let service: DBTaskService;
  let platformSpy: jasmine.SpyObj<Platform>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  beforeEach( async () => {
    platformSpy = jasmine.createSpyObj('Platform', ['ready']);
    platformSpy.ready.and.returnValue(Promise.resolve('ready'));

    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastControllerSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    } as any));

    TestBed.configureTestingModule({
      providers: [
        DBTaskService,
        { provide: Platform, useValue: platformSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: SQLite, useValue: mockSQLite }
      ]
    });

    service = TestBed.inject(DBTaskService);
    mockSQLiteObject.executeSql.and.returnValue(Promise.resolve({ rowsAffected: 0 }));

    await service.initDatabase();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('mapBooleanToSQlite debería mapear true a 1 y false a 0', () => {
    expect(service['mapBooleanToSQlite'](true)).toBe(1);
    expect(service['mapBooleanToSQlite'](false)).toBe(0);
  });

  it('addExperience debería insertar una experiencia y llamar a loadExperiences', async () => {
    const newExp: Experience = {
      company: 'Test Company',
      startYear: 2020,
      currentJob: true,
      endYear: null,
      jobPosition: 'Developer'
    };
    spyOn(service, 'loadExperiences');
    mockSQLiteObject.executeSql.and.returnValue(Promise.resolve({ rowsAffected: 1 }));

    const result = await service.addExperience(newExp);

    expect(mockSQLiteObject.executeSql).toHaveBeenCalledWith(
      jasmine.stringContaining('INSERT INTO experience'),
      [newExp.company, newExp.startYear, 1, null, newExp.jobPosition]
    );
    expect(service.loadExperiences).toHaveBeenCalled();
    expect(result).toBeTrue();
  });
});