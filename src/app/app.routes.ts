import { Routes } from '@angular/router';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { Login } from './login/login';
import { AdminRisk } from './features/admin/admin-risk/admin-risk';
import { AdminEngage } from './features/admin/admin-engage/admin-engage';
import { AdminCampaigns } from './features/admin/admin-campaigns/admin-campaigns';
import { AdminAnalytics } from './features/admin/admin-analytics/admin-analytics';
import { RoleGuard } from './core/auth/role.guard';
import { AdminPlolicyList } from './features/admin/admin-plolicy-list/admin-plolicy-list';
import { CustomerDashboard } from './features/customer/customer-dashboard/customer-dashboard';
import { CustomerSettings } from './features/customer/customer-settings/customer-settings';
import { LoggedOutGuard } from './core/auth/logged-out.guard';

export const routes: Routes = [
    {path: 'admin/dashboard', component:AdminDashboard, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/risk', component:AdminRisk, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/engage', component:AdminEngage, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/campaigns', component:AdminCampaigns, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/analytics', component:AdminAnalytics, canActivate: [RoleGuard], data: {roles: ['admin']}},

     {
    path: 'admin/policies/all',
    canActivate: [RoleGuard],
    component: AdminPlolicyList,
    data: { policyType: 'All', roles: ['admin'] }
  },
  {
    path: 'admin/policies/motor',
    canActivate: [RoleGuard],
    component: AdminPlolicyList,
    data: { policyType: 'Motor', roles: ['admin'] }
  },
  {
    path: 'admin/policies/health',
    canActivate: [RoleGuard],
    component: AdminPlolicyList,
    data: { policyType: 'Health', roles: ['admin'] }
  },
  {path: 'customer/dashboard', component: CustomerDashboard, canActivate: [RoleGuard], data: {roles: ['customer']}},
  {path: 'customer/settings', component: CustomerSettings, canActivate: [RoleGuard], data: {roles: ['customer']}},



    
    {path: '', component:Login, canActivate: [LoggedOutGuard]},
];
