import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthAdminGuard } from '../../guard/auth-admin.guard';

const routes: Routes = [
  { path: '', component: AdminComponent, canActivate: [AuthAdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}