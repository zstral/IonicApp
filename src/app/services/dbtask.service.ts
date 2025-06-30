import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

import { User } from '../models/user.model';
import { Task } from '../models/task.model';
import { Experience } from '../models/exp.model';
import { Certs } from '../models/certs.model';

@Injectable({
  providedIn: 'root'
})
export class DBTaskService {

  public database!: SQLiteObject;
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _users = new BehaviorSubject<User[]>([]);
  private _tasks = new BehaviorSubject<Task[]>([]);
  private _exps = new BehaviorSubject<Experience[]>([]);
  private _certs = new BehaviorSubject<Certs[]>([]);
  
  users: Observable<User[]> = this._users.asObservable();
  tasks: Observable<Task[]> = this._tasks.asObservable();
  exps: Observable<Experience[]> = this._exps.asObservable();
  certs: Observable<Certs[]> = this._certs.asObservable();

  usersTable: string = `CREATE TABLE IF NOT EXISTS user (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username VARCHAR(18) UNIQUE NOT NULL,
                        password VARCHAR(50) NOT NULL,
                        nombre VARCHAR(50) NOT NULL,
                        apellido VARCHAR(50) NOT NULL,
                        nivelEducacion VARCHAR(50) NOT NULL,
                        fechaNacimiento VARCHAR(50) NOT NULL
                      );`;

  tasksTable: string = `CREATE TABLE IF NOT EXISTS task (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title VARCHAR(50) NOT NULL,
                        completed BOOLEAN NOT NULL,
                        category VARCHAR(50)
                      );`;

  expTable: string = `CREATE TABLE IF NOT EXISTS experience (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        company VARCHAR(50) NOT NULL,
                        startYear INTEGER NOT NULL,
                        currentJob BOOLEAN NOT NULL,
                        endYear INTEGER,
                        jobPosition VARCHAR(50) NOT NULL
                      );`;

  certsTable: string = `CREATE TABLE IF NOT EXISTS certs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name VARCHAR(50) NOT NULL,
                        acquiredDate TEXT,
                        expirationDate TEXT
                      );`;

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    private toastController: ToastController
  ) {
    this.platform.ready().then(() => {
      this.initDatabase();
    }).catch(error => {
      console.log('Plataforma no disponible', error);
      this.presentToast('Error al inicializar la base de datos');
    })
  }

  async initDatabase() {
    try {
      this.database = await this.sqlite.create({
        name: 'ionicdb.db',
        location: 'default'
      });
      console.log('Base de datos creada');

      await this.database.executeSql(this.usersTable, []);
      await this.database.executeSql(this.tasksTable, []);
      await this.database.executeSql(this.expTable, []);
      await this.database.executeSql(this.certsTable, []);
      console.log('Tablas creadas');

      this.isDbReady.next(true);
    } catch (error) {
      console.error('Error al crear la base de datos', error);
      this.presentToast('Error al crear la base de datos');
    }
  }

  getDatabaseState(): Observable<boolean> {
    return this.isDbReady.asObservable();
  }

  private async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  private mapBooleanToSQlite(value: boolean): number {
    return value ? 1 : 0;
  }

  private mapSQliteToBoolean(value: number): boolean {
    return value === 1;
  }

  // ---Métodos CRUD---

  // ---Users
  async addUser(user: User): Promise<boolean> {

    if (!this.database) {
      console.error('La base de datos no esta disponible');
      this.presentToast('Error: La base de datos no esta disponible');
      return false;
    }

    const sql = `
      INSERT INTO user (username, password, nombre, apellido, nivelEducacion, fechaNacimiento)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const data = [
      user.username,
      user.password,
      user.nombre,
      user.apellido,
      user.nivelEducacion,
      user.fechaNacimiento
    ];

    try {
      const res = await this.database.executeSql(sql, data);
      console.log('Registro exitoso', res);
      this.loadUsers();
      this.presentToast('Te has registrado exitosamente');
      return true;
    } catch (error: any) {
      console.error('Error al registrar el usuario', error);
      if (error.message.includes('UNIQUE constraint failed: user.username')) {
        this.presentToast('El usuario ya existe');        
      } else {
        this.presentToast('Error al registrar el usuario');
      }
      return false;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.database) return null;
    const sql = `SELECT * FROM user WHERE username = ?;`;
    try {
      const res = await this.database.executeSql(sql, [username]);
      if (res.rows.length > 0) {
        return res.rows.item(0) as User;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario por username:', error);
      return null;
    }
  }

  async loadUsers() {
    if (!this.database) return;
    try {
      const res = await this.database.executeSql('SELECT * FROM user;', []);
      let users: User[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        users.push(res.rows.item(i));
      }
      this._users.next(users);
      console.log('Usuarios cargados:', users);
    } catch (e) {
      console.error('Error al cargar usuarios:', e);
    }
  }

  // ---Tasks
  async addTask(task: Task): Promise<boolean> {
    if (!this.database) return false;
    const sql = `
      INSERT INTO task (title, completed, category)
      VALUES (?, ?, ?);
    `;
    const data = [task.title, this.mapBooleanToSQlite(task.completed), task.category || null];
    try {
      const res = await this.database.executeSql(sql, data);
      console.log('Tarea creada exitosamente', res);
      this.loadTasks();
      this.presentToast('Tarea creada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al crear la tarea', error);
      this.presentToast('Error al crear la tarea');
      return false;
    }
  }

  async updateTask(task: Task): Promise<boolean> {
    if (!this.database) return false;
    const sql = `
      UPDATE task
      SET title = ?, completed = ?, category = ?
      WHERE id = ?;
    `;
    const data = [task.title, this.mapBooleanToSQlite(task.completed), task.category || null, task.id];
    try {
      const res = await this.database.executeSql(sql, data);
      console.log('Tarea actualizada exitosamente', res);
      this.loadTasks();
      this.presentToast('Tarea actualizada exitosamente');
      return res.rowsAffected > 0;
    } catch (error) {
      console.error('Error al actualizar la tarea', error);
      this.presentToast('Error al actualizar la tarea');
      return false;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    if (!this.database) return false;
    const sql = `DELETE FROM task WHERE id = ?;`;
    try {
      const res = await this.database.executeSql(sql, [id]);
      this.loadTasks();
      this.presentToast('Tarea eliminada.');
      return res.rowsAffected > 0;
    } catch (e) {
      console.error('Error al eliminar tarea:', e);
      this.presentToast('Error al eliminar tarea.');
      return false;
    }
  }

  async loadTasks() {
    if (!this.database) return;
    try {
      const res = await this.database.executeSql('SELECT * FROM task;', []);
      let tasks: Task[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        const item = res.rows.item(i);
        tasks.push({
          id: item.id,
          title: item.title,
          completed: this.mapSQliteToBoolean(item.completed),
          category: item.category
        });
      }
      this._tasks.next(tasks);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  }

  // ---Experience
  async addExperience(exp: Experience): Promise<boolean> {
    if (!this.database) return false;
    const sql = `
      INSERT INTO exp (company, startYear, currentJob, endYear, jobPosition)
      VALUES (?, ?, ?, ?, ?);
    `;
    const data = [
      exp.company,
      exp.startYear,
      this.mapBooleanToSQlite(exp.currentJob),
      exp.endYear || null,
      exp.jobPosition
    ];
    try {
      const res = await this.database.executeSql(sql, data);
      this.loadExperiences();
      this.presentToast('Experiencia agregada.');
      return true;
    } catch (e) {
      console.error('Error al añadir experiencia:', e);
      this.presentToast('Error al agregar experiencia.');
      return false;
    }
  }

  async updateExperience(exp: Experience): Promise<boolean> {
    if (!this.database) return false;
    const sql = `
      UPDATE exp
      SET company = ?, startYear = ?, currentJob = ?, endYear = ?, jobPosition = ?
      WHERE id = ?;
    `;
    const data = [
      exp.company,
      exp.startYear,
      this.mapBooleanToSQlite(exp.currentJob),
      exp.endYear || null,
      exp.jobPosition,
      exp.id
    ];
    try {
      const res = await this.database.executeSql(sql, data);
      this.loadExperiences();
      this.presentToast('Experiencia actualizada.');
      return res.rowsAffected > 0;
    } catch (e) {
      console.error('Error al actualizar experiencia:', e);
      this.presentToast('Error al actualizar experiencia.');
      return false;
    }
  }

  async deleteExperience(id: number): Promise<boolean> {
    if (!this.database) return false;
    const sql = `DELETE FROM exp WHERE id = ?;`;
    try {
      const res = await this.database.executeSql(sql, [id]);
      this.loadExperiences();
      this.presentToast('Experiencia eliminada.');
      return res.rowsAffected > 0;
    } catch (e) {
      console.error('Error al eliminar experiencia:', e);
      this.presentToast('Error al eliminar experiencia.');
      return false;
    }
  }

  async loadExperiences() {
    if (!this.database) return;
    try {
      const res = await this.database.executeSql('SELECT * FROM exp;', []);
      let experiences: Experience[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        const item = res.rows.item(i);
        experiences.push({
          ...item,
          currentJob: this.mapSQliteToBoolean(item.currentJob)
        });
      }
      this._exps.next(experiences);
    } catch (e) {
      console.error('Error al cargar experiencias:', e);
    }
  }

  // ---Certs
  async addCert(cert: Certs): Promise<boolean> {
    if (!this.database) return false;
    const sql = `
      INSERT INTO certs (name, acquiredDate, expirationDate)
      VALUES (?, ?, ?);
    `;
    const data = [
      cert.name,
      cert.acquiredDate || null,
      cert.expirationDate || null
    ];
    try {
      const res = await this.database.executeSql(sql, data);
      this.loadCerts();
      this.presentToast('Certificación agregada.');
      return true;
    } catch (e) {
      console.error('Error al añadir certificación:', e);
      this.presentToast('Error al agregar certificación.');
      return false;
    }
  }

  async updateCert(cert: Certs): Promise<boolean> {
    if (!this.database) return false;
    const sql = `
      UPDATE certs
      SET name = ?, acquiredDate = ?, expirationDate = ?
      WHERE id = ?;
    `;
    const data = [
      cert.name,
      cert.acquiredDate || null,
      cert.expirationDate || null,
      cert.id
    ];
    try {
      const res = await this.database.executeSql(sql, data);
      this.loadCerts();
      this.presentToast('Certificación actualizada.');
      return res.rowsAffected > 0;
    } catch (e) {
      console.error('Error al actualizar certificación:', e);
      this.presentToast('Error al actualizar certificación.');
      return false;
    }
  }

  async deleteCert(id: number): Promise<boolean> {
    if (!this.database) return false;
    const sql = `DELETE FROM certs WHERE id = ?;`;
    try {
      const res = await this.database.executeSql(sql, [id]);
      this.loadCerts();
      this.presentToast('Certificación eliminada.');
      return res.rowsAffected > 0;
    } catch (e) {
      console.error('Error al eliminar certificación:', e);
      this.presentToast('Error al eliminar certificación.');
      return false;
    }
  }

  async loadCerts() {
    if (!this.database) return;
    try {
      const res = await this.database.executeSql('SELECT * FROM certs;', []);
      let certs: Certs[] = [];
      for (let i = 0; i < res.rows.length; i++) {
        certs.push(res.rows.item(i));
      }
      this._certs.next(certs);
    } catch (e) {
      console.error('Error al cargar certificaciones:', e);
    }
  }

}
