
   
// src/app/features/admin/admin-engage/admin-engage.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { Sidebar } from '../../../shared/sidebar/sidebar';
import{ MockDataService, Reminder, Customer } from '../../../features/admin/admin.service'; ;

// ✅ Import shared service and types (no local interfaces/mock

type Mode = 'EMAIL' | 'SMS';
22

@Component({
  selector: 'app-admin-engage',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './admin-engage.html',
  styleUrls: ['./admin-engage.css']
})
export class AdminEngage implements OnInit {
  // Stream of reminders from the shared service
  reminders$!: Observable<Reminder[]>;
  // Customers loaded from the shared service (used for bulk operations)
  customers: Customer[] = [];

  custIdFilter = '';

  // Single-customer reminder form (type comes from the shared service)
  singleForm: Reminder = {
    cust_id: 0,
    policy_id: 0,
    category: 'HEALTH',
    date_sent: '',
    mode: 'EMAIL',
    trigger: '',
    status: 'SCHEDULED'
  };

  // Bulk reminder form (pure UI state)
  bulkForm: {
    riskThreshold: number;
    category: Reminder['category'] | 'ANY';
    date_sent: string;
    mode: Mode;
    trigger: string;
  } = {
    riskThreshold: 70,
    category: 'ANY',
    date_sent: '',
    mode: 'SMS',
    trigger: 'Policy renewal reminder'
  };

  creating = false;
  bulkCreating = false;
  lastBulkCreatedCount: number | null = null;

  constructor(private data: MockDataService) {}

  ngOnInit(): void {
    // Load reminders & customers from the single service
    this.loadAll();
    // Load customers and risk feed in parallel and merge risk_score into customers
    forkJoin({
      customers: this.data.listCustomers(),
      risks: this.data.listRiskDashboard()
    }).subscribe({
      next: ({ customers, risks }) => {
        const riskMap = new Map<number, number>();
        risks.forEach(r => riskMap.set(r.cust_id, r.risk_score));
        // Merge risk_score into each customer (preserve any existing customer.risk_score)
        this.customers = customers.map(c => ({ ...c, risk_score: riskMap.get(c.cust_id) ?? c.risk_score }));
      }
    });
  }

  // Load all reminders
  loadAll(): void {
    this.reminders$ = this.data.listReminders();
  }

  // Filter reminders by customer ID
  filterByCustomer(): void {
    const id = Number(this.custIdFilter);
    this.reminders$ = id ? this.data.listRemindersByCustomer(id) : this.data.listReminders();
  }

  // --- Create reminder for a specific customer ---
  createForCustomer(): void {
    const f = this.singleForm;
    if (!f.cust_id || !f.policy_id || !f.date_sent || !f.trigger) {
      alert('Please fill Customer ID, Policy ID, Date, and Trigger.');
      return;
    }
    this.creating = true;

    // Uses the single shared service
    this.data.createReminder({ ...f }).subscribe({
      next: () => {
        this.creating = false;
        this.resetSingleForm();
        this.loadAll();
        alert(`Reminder created for customer ${f.cust_id}`);
      },
      error: () => {
        this.creating = false;
        alert('Failed to create reminder.');
      }
    });
  }

  // --- Bulk create reminders by risk score + category ---
  bulkCreateByRiskScore(): void {
    if (!this.bulkForm.date_sent || !this.bulkForm.trigger) {
      alert('Please fill Date and Trigger for bulk creation.');
      return;
    }

    const targets = this.filteredCustomers;
    if (!targets.length) {
      alert('No customers match the selected risk threshold/category.');
      return;
    }

    this.bulkCreating = true;

    const requests = targets.map(c => {
      const reminder: Reminder = {
        cust_id: c.cust_id,          // from Customer model in service
        policy_id: c.policy_id ?? 0, // policy_id may be optional in Customer; default to 0 if missing
        // Ensure category is a valid Reminder category (fallback to bulkForm or 'HEALTH')
        category:
          (c.category as Reminder['category']) ??
          (this.bulkForm.category !== 'ANY' ? (this.bulkForm.category as Reminder['category']) : 'HEALTH'),
        date_sent: this.bulkForm.date_sent,
        mode: this.bulkForm.mode,
        trigger: this.bulkForm.trigger,
        status: 'SCHEDULED'
      };
      return this.data.createReminder(reminder);
    });

    forkJoin(requests).subscribe({
      next: created => {
        this.bulkCreating = false;
        this.lastBulkCreatedCount = created.length;
        this.loadAll();
        alert(`Created ${created.length} reminders for selected customers.`);
      },
      error: () => {
        this.bulkCreating = false;
        alert('Bulk creation failed.');
      }
    });
  }

  // Customers that meet the bulk filter (derived from service-provided customers)
  get filteredCustomers(): Customer[] {
    return this.customers.filter(c => {
      const meetsRisk = (c as any).risk_score !== undefined
        ? (c as any).risk_score >= this.bulkForm.riskThreshold
        : true; // if your Customer doesn't expose risk_score publicly, skip this criterion
      const meetsCategory =
        this.bulkForm.category === 'ANY' || c.category === this.bulkForm.category;
      return meetsRisk && meetsCategory;
    });
  }

  // Quick-fill single form from a customer row
  fillFromCustomer(c: Customer): void {
    this.singleForm = {
      cust_id: c.cust_id,
      policy_id: c.policy_id ?? 0,
      category: (c.category as Reminder['category']) ?? 'HEALTH',
      date_sent: '',
      mode: 'EMAIL',
      trigger: '',
      status: 'SCHEDULED'
    };
  }

  resetSingleForm(): void {
    this.singleForm = {
      cust_id: 0,
      policy_id: 0,
      category: 'HEALTH',
      date_sent: '',
      mode: 'EMAIL',
      trigger: '',
      status: 'SCHEDULED'
    };
  }

  // Helper to get merged risk_score for a given customer id
  getRiskForCust(custId: number): number | undefined {
    const c = this.customers.find(x => x.cust_id === custId);
    return c?.risk_score;
  }
}

