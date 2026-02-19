import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
 
export interface Customer {
  customerId: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  riskLevel: string;
}
 
@Injectable({
  providedIn: 'root',
})
export class CustomerDetailsService {
 
  private baseUrl = `${environment.apiUrl}/api/customers`;
 
  constructor(private http: HttpClient) {}
 
  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Customer API Error:', err);
          return throwError(() => err);
        })
      );
  }
}