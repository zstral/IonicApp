import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { DBTaskService } from './dbtask.service';
import { User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let storageSpy: jasmine.SpyObj<Storage>;
  let dbTaskServiceSpy: jasmine.SpyObj<DBTaskService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const testUser: User = {
    id: 1,
    username: 'testuser',
    password: '1234',
    nombre: 'Test',
    apellido: 'User',
    nivelEducacion: 'Universitario',
    fechaNacimiento: '1990-01-01'
  };

  beforeEach( async () => {
    storageSpy = jasmine.createSpyObj('Storage', ['create', 'set', 'get', 'remove']);
    storageSpy.create.and.returnValue(Promise.resolve(storageSpy));
    storageSpy.set.and.returnValue(Promise.resolve());
    storageSpy.get.and.returnValue(Promise.resolve(null));
    storageSpy.remove.and.returnValue(Promise.resolve());

    dbTaskServiceSpy = jasmine.createSpyObj('DBTaskService', ['getUserByUsername', 'getDatabaseState']);
    dbTaskServiceSpy.getDatabaseState.and.returnValue(of(true));

    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Storage, useValue: storageSpy },
        { provide: DBTaskService, useValue: dbTaskServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    await service['initStorage']();
    await service.loadSession();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería iniciar sesión correctamente', async () => {
    dbTaskServiceSpy.getUserByUsername.and.returnValue(Promise.resolve(testUser));

    const loggedIn = await service.login(testUser.username, testUser.password);

    expect(loggedIn).toBeTrue();
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('debería cerrar sesión', async () => {
    service['_isAuthenticated'].next(true);
    service['_currentUser'].next(testUser);

    await service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], jasmine.objectContaining({ replaceUrl: true }));
  });
});