import { Injectable } from '@angular/core';

import { Policy } from './policy.model';



@Injectable({
  providedIn: 'root',
})
export class AdminPolicyData {

  // Store ALL dummy data inside the service
  private readonly policies: Policy[] = [
    // ---- Motor Policies (5) ----
    {
      policyId: 'MTR-001',
      policyName: 'Swift Shield Car Cover',
      policyType: 'Motor',
      policyCategory: 'Car Insurance',
      coverageAmount: 1000000,
      premiumAmount: 12000,
      durationYears: 1,
      description: 'Comprehensive car insurance with zero depreciation and roadside assistance.',
      status: 'Active',
      createdDate: '2025-03-15'
    },
    {
      policyId: 'MTR-002',
      policyName: 'BikeGuard Plus',
      policyType: 'Motor',
      policyCategory: 'Bike Insurance',
      coverageAmount: 300000,
      premiumAmount: 4500,
      durationYears: 1,
      description: 'Two-wheeler policy covering theft, damage, and third-party liability.',
      status: 'Active',
      createdDate: '2024-12-01'
    },
    {
      policyId: 'MTR-003',
      policyName: 'FleetSecure',
      policyType: 'Motor',
      policyCategory: 'Commercial Vehicles',
      coverageAmount: 2500000,
      premiumAmount: 32000,
      durationYears: 2,
      description: 'Commercial vehicle coverage for fleets with driver coverage add-ons.',
      status: 'Inactive',
      createdDate: '2025-07-21'
    },
    {
      policyId: 'MTR-004',
      policyName: 'UrbanDrive Lite',
      policyType: 'Motor',
      policyCategory: 'Car Insurance',
      coverageAmount: 600000,
      premiumAmount: 8000,
      durationYears: 1,
      description: 'Affordable car insurance for city commuters with cashless garages.',
      status: 'Active',
      createdDate: '2025-05-10'
    },
    {
      policyId: 'MTR-005',
      policyName: 'ClassicRide',
      policyType: 'Motor',
      policyCategory: 'Vintage Cars',
      coverageAmount: 1500000,
      premiumAmount: 15000,
      durationYears: 1,
      description: 'Specialized coverage for vintage and classic automobiles.',
      status: 'Inactive',
      createdDate: '2025-01-25'
    },

    // ---- Health Policies (5) ----
    {
      policyId: 'HLT-001',
      policyName: 'Family Health Secure',
      policyType: 'Health',
      policyCategory: 'Family Health',
      coverageAmount: 2000000,
      premiumAmount: 18000,
      durationYears: 1,
      description: 'Covers hospitalization, maternity, and child wellness for families.',
      status: 'Active',
      createdDate: '2024-11-20'
    },
    {
      policyId: 'HLT-002',
      policyName: 'SeniorCare Comprehensive',
      policyType: 'Health',
      policyCategory: 'Senior Health',
      coverageAmount: 2500000,
      premiumAmount: 26000,
      durationYears: 2,
      description: 'Includes pre-existing disease coverage with short waiting periods.',
      status: 'Active',
      createdDate: '2025-02-14'
    },
    {
      policyId: 'HLT-003',
      policyName: 'Wellness Plus',
      policyType: 'Health',
      policyCategory: 'Individual Health',
      coverageAmount: 1000000,
      premiumAmount: 9000,
      durationYears: 1,
      description: 'Individual plan with OPD benefits and annual checkups.',
      status: 'Inactive',
      createdDate: '2025-08-02'
    },
    {
      policyId: 'HLT-004',
      policyName: 'CriticalCare Shield',
      policyType: 'Health',
      policyCategory: 'Critical Illness',
      coverageAmount: 3000000,
      premiumAmount: 22000,
      durationYears: 3,
      description: 'Lump sum payout on diagnosis of listed critical illnesses.',
      status: 'Active',
      createdDate: '2025-06-05'
    },
    {
      policyId: 'HLT-005',
      policyName: 'Group Health Advantage',
      policyType: 'Health',
      policyCategory: 'Group Health',
      coverageAmount: 5000000,
      premiumAmount: 45000,
      durationYears: 1,
      description: 'Customizable group health plan suitable for SMEs and enterprises.',
      status: 'Inactive',
      createdDate: '2024-10-10'
    }
  ];

  constructor() {}

  getAllPolicies(): Policy[] {
    // Return a shallow copy for immutability safety
    return [...this.policies];
  }

  getMotorPolicies(): Policy[] {
    return this.policies.filter(p => p.policyType === 'Motor');
  }

  getHealthPolicies(): Policy[] {
    return this.policies.filter(p => p.policyType === 'Health');
  }
  
}
