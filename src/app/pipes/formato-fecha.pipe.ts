import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha'
})
export class FormatoFechaPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const fecha = new Date(value);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }
}
