import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appSoloNumeros]'
})
export class SoloNumerosDirective {
  @HostListener('keypress', ['$event']) onKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
