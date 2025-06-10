import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

export const emailVerificadoGuard: CanActivateFn = async (route, state) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (!session || !session.user) {
    return false;
  }

 const { data: userDetails } = await supabase.auth.getUser();
const user = userDetails?.user;

if (!user?.email_confirmed_at) {
  alert('Debes verificar tu correo para continuar.');
  return false;
}

  return true;
};
