import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptchaComponent } from './captcha.component';
import { RecaptchaModule } from 'ng-recaptcha';

@NgModule({
  declarations: [CaptchaComponent],
  imports: [
    CommonModule,
    RecaptchaModule
  ],
  exports: [CaptchaComponent]
})
export class CaptchaModule {}
