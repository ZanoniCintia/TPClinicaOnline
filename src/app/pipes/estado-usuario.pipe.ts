import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoUsuario' })
export class EstadoUsuarioPipe implements PipeTransform {
  transform(activo: boolean): string {
    return activo ? '🟢 Activo' : '🔴 Inactivo';
  }
}
