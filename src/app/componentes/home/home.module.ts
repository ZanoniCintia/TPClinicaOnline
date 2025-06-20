import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from '../home/home-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalInputModule } from "../modal-input/modal-input.module";


@NgModule({
  declarations: [HomeComponent],
  imports: [

    CommonModule,
    FormsModule,
    RouterModule,
    HomeRoutingModule,
    ModalInputModule
]
})
export class HomeModule {}