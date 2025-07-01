import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appEstadoColor]'
})
export class EstadoColorDirective implements OnChanges {
  @Input() appEstadoColor: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    this.el.nativeElement.style.color = this.appEstadoColor ? 'green' : 'red';
  }
}
