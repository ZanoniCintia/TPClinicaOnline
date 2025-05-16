import { Component, OnInit } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone:false,
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  supabase: SupabaseClient;
  userEmail: string = '';
  userName: string = '';
  resultados: any[] = [];
  juegoActual: string = '';
  paginaActual: number = 0;

  constructor(private route: ActivatedRoute) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    const { data: { session } } = await this.supabase.auth.getSession();
    const user = session?.user;

    this.route.queryParams.subscribe(params => {
      this.juegoActual = params['juego'] || '';
      this.cargarRanking();
    });

    if (user) {
      this.userEmail = user.email || '';

      const { data: usuario } = await this.supabase
        .from('usuarios')
        .select('name')
        .eq('email', this.userEmail)
        .single();

      this.userName = usuario?.name || '';
    }
  }

  async cargarRanking() {
    const { data, error } = await this.supabase
      .from('puntos')
      .select('email, puntos, fecha')
      .eq('juego', this.juegoActual.trim())
      .order('puntos', { ascending: false });

    if (error) {
      console.error('❌ Error al cargar ranking:', error.message);
    } else {
      this.resultados = data || [];
    }

    console.log('Juego actual:', this.juegoActual);
    console.log('Ranking obtenido:', this.resultados);
  }

  get totalPaginas(): number {
    return Math.ceil(this.resultados.length / 10);
  }
}
