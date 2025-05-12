import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreguntadosService {
  private apiUrl = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';

  constructor(private http: HttpClient) {}

  obtenerPersonajesSimpsons(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
