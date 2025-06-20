import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';


@NgModule({
  declarations: [AdminComponent],
  imports: [
   
    CommonModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule {}
