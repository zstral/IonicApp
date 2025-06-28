import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { DBTaskService } from './dbtask.service';

const USER_SESSION_KEY = 'user_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this._isAuthenticated.asObservable();

  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$: Observable<User | null> = this._currentUser.asObservable();

  private _storage: Storage | null = null;

  constructor(
    private storage: Storage,
    private dbTaskService: DBTaskService,
    private router: Router
  ) {
    this.initStorage();
    this.dbTaskService.getDatabaseState().subscribe(ready => {
      if (ready) {
        console.log('DB lista en AuthService.');
        this.loadSession();
      } else {
        console.log('DB no lista en AuthService.');
      }
    });
  }

  async initStorage() {
    this._storage = await this.storage.create();
  }

  async login(username: string, passwordAttempt: string): Promise<boolean> {
    if (!this._storage) {
      console.error('No se ha inicializado el almacenamiento.');
      return false;
    }

    const userFromDb = await this.dbTaskService.getUserByUsername(username);

    if (userFromDb && userFromDb.password === passwordAttempt) {
      console.log('Inicio de sesión exitoso');
      const { password, ...userToStore } = userFromDb;

      await this._storage.set(USER_SESSION_KEY, userToStore);
      this._isAuthenticated.next(true);
      this._currentUser.next(userFromDb);
      return true;
    } else {
      return false;
    }
  }

  async logout(): Promise<void> {
    if (!this._storage) {
      console.error('No se ha inicializado el almacenamiento.');
      return;
    }
    await this._storage.remove(USER_SESSION_KEY);
    this._isAuthenticated.next(false);
    this._currentUser.next(null);
    console.log('Cierre de sesión exitoso');
    this.router.navigate(['/login']), { replaceUrl: true };
  } 

  async loadSession(): Promise<void> {
    if (!this._storage) {
      console.error('No se ha inicializado el almacenamiento. Reitentando...');
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!this._storage) {
        console.error('Error: No se ha podido cargar la sesión.');
        return;
      }
    }
    
    try {
      const storedUser = await this._storage.get(USER_SESSION_KEY);
      if (storedUser) {
        console.log('Sesión cargada:', storedUser);
        this._isAuthenticated.next(true);
        this._currentUser.next(storedUser);
      } else {
        console.log('No hay sesión activa.');
        this._isAuthenticated.next(false);
      }
    } catch (error) {
      console.error('Error al cargar la sesión:', error);
      this._isAuthenticated.next(false);
    }
  } 

  isLoggedIn(): boolean {
    return this._isAuthenticated.getValue();
  }

  getCurrentUser(): User | null {
    return this._currentUser.getValue();
  }

}
