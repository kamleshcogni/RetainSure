import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Policy } from './policy.model';



@Injectable({
  providedIn: 'root',
})
export class AdminPolicyData {
 private baseUrl = 'http://localhost:8080/api/policies';
 
  constructor(private http: HttpClient) {}
 
  getAll(): Observable<Policy[]> {
    return this.http.get<Policy[]>(this.baseUrl);
  }
 
  create(policy: Policy): Observable<Policy> {
    return this.http.post<Policy>(this.baseUrl, policy);
  }
 
  update(id: number, policy: Policy): Observable<Policy> {
    return this.http.put<Policy>(`${this.baseUrl}/${policy.policyId
      
    }`, policy);
  }
 
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
