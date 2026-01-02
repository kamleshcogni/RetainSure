import { Routes } from '@angular/router';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { Login } from './login/login';
import { AdminRisk } from './features/admin/admin-risk/admin-risk';
import { AdminEngage } from './features/admin/admin-engage/admin-engage';
import { AdminCampaigns } from './features/admin/admin-campaigns/admin-campaigns';
import { AdminAnalytics } from './features/admin/admin-analytics/admin-analytics';
import { AdminSettings } from './features/admin/admin-settings/admin-settings';
import { RoleGuard } from './core/auth/role.guard';
import { AdminPlolicyList } from './features/admin/admin-plolicy-list/admin-plolicy-list';

export const routes: Routes = [
    {path: 'admin/dashboard', component:AdminDashboard, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/risk', component:AdminRisk, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/engage', component:AdminEngage, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/campaigns', component:AdminCampaigns, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/analytics', component:AdminAnalytics, canActivate: [RoleGuard], data: {roles: ['admin']}},
    {path: 'admin/settings', component:AdminSettings, canActivate: [RoleGuard], data: {roles: ['admin']}},

     {
    path: 'admin/policies/all',
    component: AdminPlolicyList,
    data: { policyType: 'All' }
  },
  {
    path: 'admin/policies/motor',
    component: AdminPlolicyList,
    data: { policyType: 'Motor' }
  },
  {
    path: 'admin/policies/health',
    component: AdminPlolicyList,
    data: { policyType: 'Health' }
  },




    
    {path: '', component:Login},
    {path: '**', redirectTo:''}
];
