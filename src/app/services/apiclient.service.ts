import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}
// -------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {

  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${this.apiUrl}/${id}`);
  }
}