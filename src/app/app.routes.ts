import { Routes } from '@angular/router';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { Login } from './login/login';
import { AdminRisk } from './features/admin/admin-risk/admin-risk';
import { AdminEngage } from './features/admin/admin-engage/admin-engage';
import { AdminCampaigns } from './features/admin/admin-campaigns/admin-campaigns';
import { AdminAnalytics } from './features/admin/admin-analytics/admin-analytics';
import { AdminSettings } from './features/admin/admin-settings/admin-settings';

export const routes: Routes = [
    {path: 'admin/dashboard', component:AdminDashboard},
    {path: 'admin/risk', component:AdminRisk},
    {path: 'admin/engage', component:AdminEngage},
    {path: 'admin/campaigns', component:AdminCampaigns},
    {path: 'admin/analytics', component:AdminAnalytics},
    {path: 'admin/settings', component:AdminSettings},
    {path: '', component:Login},
    {path: '**', redirectTo:''}
];
