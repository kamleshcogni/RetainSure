 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../shared/navbar/navbar';
import { CustomerService, Policy, DashboardCustomer, Reminder } from '../customer.service';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
 
@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard implements OnInit {
  dashboardData$!: Observable<DashboardCustomer>;
  selectedPolicy?: Policy;
 
  private refresh$ = new BehaviorSubject<void>(undefined);
 
  constructor(private customerService: CustomerService) {}
 
  ngOnInit(): void {
    this.dashboardData$ = this.refresh$.pipe(
      switchMap(() => this.customerService.getDashboard()),
      tap(data => {
        if (data.policies?.length) {
          data.policies = [...data.policies].sort((a, b) => {
            const statusRank = (p: Policy) => (p.status === 'ACTIVE' ? 0 : 1);
 
            const rankDiff = statusRank(a) - statusRank(b);
            if (rankDiff !== 0) return rankDiff;
 
            if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
              const aDate = a.renewalDate ? new Date(a.renewalDate).getTime() : Number.MAX_SAFE_INTEGER;
              const bDate = b.renewalDate ? new Date(b.renewalDate).getTime() : Number.MAX_SAFE_INTEGER;
              return aDate - bDate;
            }
 
            const aExp = a.expiredOn ? new Date(a.expiredOn).getTime() : 0;
            const bExp = b.expiredOn ? new Date(b.expiredOn).getTime() : 0;
            return bExp - aExp;
          });
        }
 
        if (data.reminders) {
          data.reminders = data.reminders.filter(r => r.status === 'SENT');
        }
 
        if (!this.selectedPolicy && data.policies?.length > 0) {
          this.selectedPolicy = data.policies[0];
        }
      })
    );
  }
 
  selectPolicy(p: Policy): void {
    this.selectedPolicy = p;
  }
 
  respondToReminder(rem: Reminder): void {
    this.customerService.respondToReminder(rem.reminderId).subscribe({
      next: () => {
        this.refresh$.next();
      },
      error: (err) => {
        console.error('Failed to respond to reminder:', err);
      }
    });
  }
 
  formatMoney(v: number): string {
    return `$${v.toLocaleString()}`;
  }
 
  formatDate(iso?: string): string {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}