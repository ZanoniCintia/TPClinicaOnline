# Clínica Online 

Este proyecto es una aplicación web para gestionar turnos médicos de una clínica.

## Descripción

La Clínica Online cuenta con consultorios y laboratorios, donde trabajan profesionales de distintas especialidades. Los turnos se solicitan a través de la aplicación, y los usuarios pueden registrarse como Pacientes, Especialistas o Administradores.

## Tipos de Usuarios

- **Paciente**
  - Registro con captcha y doble imagen.
  - Solicita turnos, califica la atención y completa encuestas.
  - Visualiza solo sus turnos.

- **Especialista**
  - Registro con especialidades seleccionadas o personalizadas.
  - Define su disponibilidad horaria.
  - Acepta, rechaza, cancela o finaliza turnos.

- **Administrador**
  - Visualiza todos los turnos.
  - Puede cancelar turnos.
  - Carga turnos para pacientes.

## Secciones principales

- **Inicio**
- **Registro / Login**
- **Solicitar Turno**
- **Mis Turnos**
- **Turnos (admin)**
- **Mi Perfil**

## Funcionalidades destacadas

- Captcha de Google en el registro.
- Validaciones dinámicas de turnos según usuario.
- Filtros por especialidad y profesional sin combobox.
- Manejo de imágenes en registro.
- Integración con Supabase (auth, DB, storage).

## Cómo ejecutar

```bash
npm install
ng serve
