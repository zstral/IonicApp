import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Task } from '../../models/task.model';
import { DBTaskService } from 'src/app/services/dbtask.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: false,
})
export class TasksPage implements OnInit, OnDestroy {

  tasks: Task[] = [];
  newTaskTitle: string = '';
  filteredTasks: Task[] = [];
  newTaskCategory: string = '';
  selectedCategory: string = 'Todas';
  categories: string[] = ['Personal', 'Trabajo', 'Estudio'];
  private _storage: Storage | null = null;
  userData: any;

  private tasksSubscription!: Subscription;
  private dbReadySubscription!: Subscription;

  constructor(
    private storage: Storage,
    private router: Router,
    private dbTaskService: DBTaskService
  ) { }

  ngOnInit() {
    this.initStorage();
    this.dbReadySubscription = this.dbTaskService.getDatabaseState().subscribe(ready => {
      if (ready) {
        this.tasksSubscription = this.dbTaskService.tasks.subscribe(tasks => {
          this.tasks = tasks;
          this.filterTasks();
        });
      } else {
        console.log('Base de datos no lista');
      }
    });
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
    if (this.dbReadySubscription) {
      this.dbReadySubscription.unsubscribe();
    }
  }

  async initStorage() {
    this._storage = await this.storage.create();
  }

  async addTask() {
    if (this.newTaskTitle.trim().length === 0) {
      return;
    }
    const newTask: Task = {
      title: this.newTaskTitle,
      completed: false,
      category: this.newTaskCategory || undefined
    };
    const success = await this.dbTaskService.addTask(newTask);
    if (success) {
      this.newTaskTitle = '';
      this.newTaskCategory = '';
    }
  }

  async toggleTaskCompletion(task: Task) {
    const updatedTask = { ...task, completed: !task.completed };
    await this.dbTaskService.updateTask(updatedTask);
  }

  async deleteTask(taskId: number) {
    await this.dbTaskService.deleteTask(taskId);
  }

  filterTasks() {
    if (this.selectedCategory === 'Todas') {
      this.filteredTasks = [...this.tasks];
    } else { 
      this.filteredTasks = this.tasks.filter(task => task.category === this.selectedCategory);
    }
  }

  getCategoryClass(task: Task): string[] {
    const classes: string[] = [];
    if (task.completed) classes.push('completed');
    if (task.category) classes.push(task.category.toLowerCase());
    return classes;
  }

}
