import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { TokenDetail } from './pages/token-detail/token-detail';
import { Apps } from './pages/apps/apps';
import { Forms } from './pages/forms/forms';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'home/:id', component: TokenDetail },
  { path: 'apps', component: Apps },
  { path: 'forms', component: Forms },
  { path: '', pathMatch: 'full', redirectTo: 'home' },
];
