import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';

@NgModule({

  imports: [
    HomeComponent,
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule {}
