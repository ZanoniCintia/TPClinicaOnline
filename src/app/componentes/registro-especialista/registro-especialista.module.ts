import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { CaptchaModule } from '../captcha/captcha.module'; 
import { RegistroEspecialistaRoutingModule } from './registro-especialista-routing.module';
import { RegistroEspecialistaComponent } from './registro-especialista.component';

@NgModule({
  declarations: [RegistroEspecialistaComponent],
  imports: [
    CaptchaModule,
    CommonModule,
    FormsModule,
    RouterModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    RegistroEspecialistaRoutingModule
  ],
  exports: [RegistroEspecialistaComponent] 
})
export class RegistroEspecialistaModule {}
