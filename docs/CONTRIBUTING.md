# Cómo trabajamos — Aprendizaje USCO

Este archivo es el mismo en el backend y en el frontend. Si cambia una regla, actualícenlo en los dos repositorios.

## Equipo

| Integrante | Rol |
|---|---|
| Jorel Vargas | Líder técnico y backend (auth, seguridad, motor adaptativo, entrega) |
| Juan David Polanco | Backend y datos (esquema, migraciones, servicios, integración) |
| Nicolás Pérez | Frontend (base del proyecto, diagnóstico, práctica, admin, accesibilidad) |
| Fernando Pérez | Frontend y calidad (login, CI, dashboards, pruebas, usabilidad) |

Docente: Irlesa Indira Sánchez Medina.

## Flujo de trabajo

1. Toma una tarea de Jira del sprint actual y muévela a **En curso**.
2. Crea tu rama desde `develop` actualizado:

   ```bash
   git checkout develop
   git pull
   git checkout -b feature/AU-12-login-jwt
   ```

3. Haz commits pequeños y frecuentes.
4. Antes del PR, trae lo último de `develop` y resuelve los conflictos en tu rama:

   ```bash
   git fetch origin
   git merge origin/develop
   ```

5. Abre el PR hacia `develop`, llena la plantilla y pide revisión.
6. Con 1 aprobación y CI en verde, fusiona (**Squash and merge**) y borra la rama.
7. Mueve la tarjeta de Jira a **Hecho**.

## Ramas

| Rama | Uso |
|---|---|
| `main` | Versión entregable. Solo recibe PR desde `develop` al cierre de cada sprint, con tag `v0.1`, `v0.2`… |
| `develop` | Integración. Rama por defecto. |
| `feature/AU-<n>-descripcion` | Funcionalidad nueva |
| `fix/AU-<n>-descripcion` | Corrección de un defecto |
| `docs/…`, `chore/…` | Documentación o configuración |

Nadie hace push directo a `main` ni a `develop`.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/es/), en español y en imperativo:

```
tipo(módulo): descripción corta

feat(diagnostico): calcular puntaje por dimensión
fix(auth): devolver 401 cuando el token expira
test(practica): cubrir subida y bajada de nivel
docs: agregar variables de entorno al README
```

Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`.

## Pull requests

- Pequeños: idealmente menos de 400 líneas cambiadas. Si crece mucho, divídelo.
- La clave de Jira (`AU-12`) va en el nombre de la rama y en el título del PR, para que Jira lo enlace solo.
- Si cambia la interfaz, adjunta capturas.
- **Revisor:** cualquier otro integrante. Revisa en menos de 24 h. Comenta con propuestas concretas, no solo "está mal".
- El autor resuelve los comentarios; quien comentó marca la conversación como resuelta.

## Contrato de API

Antes de programar un endpoint, backend y frontend acuerdan en la tarjeta de Jira:

- método y ruta (`POST /api/diagnosticos/{id}/respuestas`)
- JSON de entrada y de salida, con un ejemplo
- códigos de error posibles
- rol que puede usarlo

Con eso, el frontend avanza con datos simulados mientras el backend implementa. Una vez implementado, Swagger es la referencia oficial.

## Definición de terminado

Una tarea está **Hecha** cuando:

- [ ] Su PR está aprobado y fusionado en `develop`
- [ ] CI pasa (compila, pruebas y lint)
- [ ] La lógica de negocio tiene pruebas (puntaje, categoría, motor adaptativo, indicadores)
- [ ] El criterio de aceptación relacionado (CA-XX) se verificó a mano en local o staging
- [ ] Si cambió algo de configuración, rutas o variables, el README está actualizado
- [ ] La tarjeta de Jira está en Hecho

## Seguridad y datos

- Nunca se suben contraseñas, llaves ni tokens. Si pasa por error, avisa de inmediato para rotarlos: borrar el commit no basta.
- Los datos reales de estudiantes (resultados del instrumento, notas) **no** se suben al repositorio. Para pruebas se usan datos ficticios o anonimizados (Ley 1581 de 2012).

## Ritmo del equipo

| Qué | Cuándo |
|---|---|
| Daily asíncrona en el grupo: qué hice, qué haré, qué me bloquea | Todos los días |
| Reunión corta de seguimiento | 2 veces por semana |
| Revisión y planeación del sprint | Al cierre de cada sprint |

## Sprints

| Sprint | Fechas | Meta |
|---|---|---|
| 1 | 28 sep – 8 oct | Infraestructura, login por rol, esquema del diagnóstico |
| 2 | 9 oct – 20 oct | Diagnóstico de punta a punta, inicio del motor adaptativo |
| 3 | 21 oct – 1 nov | Práctica con retroalimentación, dashboards, gestión de contenidos |
| 4 | 2 nov – 12 nov | Administración, integración, pruebas y validación. **Congelamiento del MVP: 12 nov** |
