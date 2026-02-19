import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Customer, CustomerDetailsService } from './cutomer-details-service';
 
@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-detalis.html',
  styleUrl: './customer-detalis.css',
})
export class CustomerDetalis implements OnInit {
 
  customer?: Customer;
  loading = true;
  error = '';
 
  constructor(
    private route: ActivatedRoute,
    private service: CustomerDetailsService,
    private cdr: ChangeDetectorRef   // ✅ ADD THIS
  ) {}
 
 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const id = Number(params.get('id'));
 
    this.loading = true;
 
    this.service.getCustomerById(id).subscribe({
      next: (data) => {
        this.customer = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Customer not found';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  });
}
 
}