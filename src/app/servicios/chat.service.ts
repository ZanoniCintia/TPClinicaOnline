import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async obtenerMensajes() {
    const { data, error } = await this.supabase
      .from('chat')
      .select('*')
      .order('fecha_chat', { ascending: true }); 
    return { data, error };
  }
  

  async enviarMensaje(email: string, mensaje: string) {
    const { error } = await this.supabase.from('chat').insert({
      user_email: email,
      mensaje: mensaje
    });
    return { error };
  }


  escucharMensajesRealtime(callback: (nuevoMensaje: any) => void) {
    this.supabase
      .channel('chat-mensajes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        payload => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
  
}

