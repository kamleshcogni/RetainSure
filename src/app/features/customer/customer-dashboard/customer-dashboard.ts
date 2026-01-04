
// customer-dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';                 // ✅ required for *ngIf, *ngFor, ngClass
import { Navbar } from '../../../shared/navbar/navbar';
import { CustomerService, Policy, DashboardCustomer } from '../customer.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule],                              // ✅ keep your imports + add CommonModule
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard implements OnInit {
  data?: DashboardCustomer;
  selectedPolicy?: Policy;

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getDashboard().subscribe(d => {
      this.data = d;
      this.selectedPolicy = d.policies?.[0]; // default select first
      console.log(this.data)
    });
  }

  selectPolicy(p: Policy) { this.selectedPolicy = p; }

  // Helpers for display
  formatMoney(v: number) { return `$${v.toLocaleString()}`; }
  formatDate(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
