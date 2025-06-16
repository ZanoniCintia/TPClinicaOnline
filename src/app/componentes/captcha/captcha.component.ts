import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-captcha',
  templateUrl: './captcha.component.html'
})
export class CaptchaComponent {
  @Output() captchaResuelto = new EventEmitter<string>();
  @Input() siteKey!: string;

  onCaptchaResolved(token: string | null) {
    if (token) {
      this.captchaResuelto.emit(token);
    } else {
      console.warn('⚠️ Captcha no resuelto o inválido.');
    }
  }
}
