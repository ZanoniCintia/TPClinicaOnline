import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from './registro.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RegistroRoutingModule } from './registro-routing.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha';
import { CaptchaModule } from '../captcha/captcha.module'; 


@NgModule({
  declarations: [RegistroComponent],
  imports: [
  
    CaptchaModule,
    RecaptchaFormsModule ,
    RecaptchaModule ,
    CommonModule,
    FormsModule,
    RouterModule,
    RegistroRoutingModule
  ]
})
export class RegistroModule {}
