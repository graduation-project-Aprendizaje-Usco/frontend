# Aprendizaje USCO — Frontend

[![CI](https://github.com/aprendizaje-usco-project/aprendizaje-usco-frontend/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/aprendizaje-usco-project/aprendizaje-usco-frontend/actions/workflows/ci.yml?query=branch%3Adevelop)

Interfaz web de **Aprendizaje USCO**, plataforma de diagnóstico, práctica adaptativa y analítica de aprendizaje para Cálculo Diferencial (Proyecto Integrador II, Ingeniería de Software, Universidad Surcolombiana).

| | |
|---|---|
| Stack | React 19 · Vite 8 · React Router 8 · MUI · Axios · Recharts · KaTeX · Vitest |
| Backend | [aprendizaje-usco-backend](https://github.com/aprendizaje-usco-project/aprendizaje-usco-backend) |
| Tablero | Jira, proyecto `SCRUM` |
| Convenciones | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Manual técnico | [manual-tecnico.md](https://github.com/aprendizaje-usco-project/aprendizaje-usco-backend/blob/develop/docs/manual-tecnico.md) en el backend (arquitectura, despliegue, instalación completa) |
| Qué se ha implementado | [implementacion.md](implementacion.md) (historia por historia: qué hace, decisiones, cómo probarlo) |

---

## 1. Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 24 LTS (mínimo 22.12) |
| npm | el que trae Node |
| Backend corriendo | ver el README del backend (puerto 8080) |

## 2. Cómo correrlo en local

```bash
git clone https://github.com/aprendizaje-usco-project/aprendizaje-usco-frontend.git
cd aprendizaje-usco-frontend
git checkout develop
npm install
cp .env.example .env.development     # Windows: copy .env.example .env.development
npm run dev
```

Abre http://localhost:5173.

## 3. Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de `dist/` para probarlo |
| `npm run lint` | ESLint |
| `npm test` | Pruebas automáticas (Vitest + Testing Library), una sola corrida |
| `npm run test:watch` | Pruebas en modo vigilancia: se repiten al guardar |
| `npm run format` | Prettier sobre `src/` |

Antes de abrir un PR: `npm run lint`, `npm test` y `npm run build` sin errores (es lo mismo que corre CI).

Verificación registrada el **10 de noviembre de 2026**: `npm test` pasó **122 pruebas en 22 archivos** y `npm run build` generó el build de producción correctamente.

### Pruebas

- Archivos `*.test.jsx` junto al componente que prueban (`LoginPage.jsx` → `LoginPage.test.jsx`).
- Ayudas comunes en `src/test/utilidades.jsx`: `renderConApp()` (tema + enrutador + AuthProvider) y `tokenDePrueba()` (JWT con los claims del contrato).
- Las funciones de `src/api/` se simulan con `vi.mock(...)`: las pruebas no necesitan el backend.
- Cuidado con `beforeEach(() => algo.mockReset())`: si la flecha **devuelve** una función, Vitest la ejecuta como limpieza al final. Usa llaves: `beforeEach(() => { algo.mockReset(); })`.

## 4. Variables de entorno

Vite solo expone al código las variables que empiezan por `VITE_`. **No pongas secretos aquí**: todo lo que va en el frontend es visible en el navegador.

| Variable | Descripción | Desarrollo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8080/api` |
| `VITE_USE_MOCKS` | `true`: las funciones de `src/api/` responden con datos simulados, sin backend. `false` o sin definir: usan el backend real | `false` |

Con `VITE_USE_MOCKS=true` se entra con los mismos usuarios de prueba del backend (`estudiante@aprendizaje.test` / `Estudiante2026*`, etc.). Reinicia `npm run dev` después de cambiarla.

## 5. Estructura

```
src/
├── main.jsx          punto de entrada: BrowserRouter, ThemeProvider, CSS de KaTeX
├── App.jsx
├── api/              client.js (axios + token) y un archivo por módulo: authApi.js, diagnosticoApi.js…
├── routes/           AppRouter.jsx (páginas con carga diferida), ProtectedRoute.jsx
├── context/          AuthContext.jsx (sesión: el rol sale del token; se confirma con /me)
├── layouts/          EstudianteLayout, DocenteLayout, AdminLayout
├── features/
│   ├── auth/         login, registro, reglas del registro (reglasRegistro.js)
│   ├── diagnostico/  prueba de 24 ítems, resultado
│   ├── practica/     ejercicios, retroalimentación
│   ├── progreso/     dashboard de indicadores de progreso del estudiante
│   ├── docente/      dashboard docente, gestión de actividades
│   └── admin/        usuarios y roles
├── components/       reutilizables: MathText, BarraProgreso, Temporizador…
├── theme/            theme.js con los colores institucionales
├── test/             configuración y utilidades de las pruebas
└── utils/
```

Reglas:

- Cada pantalla vive en su carpeta de `features/`. Lo que usan dos o más módulos pasa a `components/`.
- Las llamadas HTTP **solo** se hacen desde `api/`; los componentes nunca usan `axios` directamente.
- El prototipo HTML es la referencia visual de cada pantalla.

## 6. Rutas y roles

| Ruta | Rol | Pantalla | Estado |
|---|---|---|---|
| `/login` | público | Inicio de sesión | Lista |
| `/registro?token=…` | público | Registro de estudiantes con invitación (correo `u` + 11 dígitos + `@usco.edu.co`) | Lista |
| `/activar-cuenta?token=…` | público | Definir la contraseña de una cuenta creada por administración | Lista |
| `/estudiante` | ESTUDIANTE | Inicio del estudiante: dashboard de progreso | Lista |
| `/estudiante/diagnostico` | ESTUDIANTE | Prueba diagnóstica y resultado | Lista |
| `/estudiante/practica` | ESTUDIANTE | Ejercicios adaptativos | Lista |
| `/estudiante/progreso` | ESTUDIANTE | Dashboard Mi progreso | Lista |
| `/docente` | DOCENTE | Dashboard de desempeño del grupo (SCRUM-40); el detalle del estudiante abre en un Drawer | Lista |
| `/docente/estudiantes` | DOCENTE | Carga del listado, estado de invitaciones y reenvío | Lista |
| `/docente/actividades` | DOCENTE | Gestión de actividades y contenidos | Lista |
| `/docente/reportes` | DOCENTE | Reportes | En construcción |
| `/admin/usuarios` | ADMIN | Administración de usuarios (SCRUM-45) | Lista |
| `/admin/grupos` | ADMIN | Grupos de los docentes y estudiantes inscritos (SCRUM-46) | Lista |
| `/admin/actividades` | ADMIN | Contenidos y ejercicios de todos los docentes (SCRUM-46) | Lista |
| `/admin` | ADMIN | Panel de administración (SCRUM-46) | Lista |
| `/admin/roles` | ADMIN | Roles y permisos: explicación y acceso a usuarios filtrados | Lista |
| `/no-autorizado` | cualquiera | Acceso denegado | Lista |

«En construcción»: la ruta y el menú existen, pero la pantalla todavía muestra `PaginaEnConstruccion`.

### Mi progreso del estudiante

La ruta `/estudiante/progreso` está protegida para `ESTUDIANTE`, se carga dentro de `EstudianteLayout` y aparece como **Mi progreso** en el menú definido en `src/routes/navegacion.js`. La pantalla está implementada en `src/features/progreso/ProgresoPage.jsx`; usa `src/api/progresoApi.js` para llamar `GET /api/progreso/me` del backend. El inicio del estudiante (`/estudiante`) reutiliza ese mismo dashboard para que el login no termine en una página en construcción.

La API del módulo llama al cliente Axios compartido `src/api/client.js`: la URL base sale de `VITE_API_URL`, el interceptor adjunta el token almacenado y la respuesta 401 sigue el flujo compartido de expiración de sesión. Los componentes no crean clientes HTTP propios ni calculan indicadores con cifras simuladas.

Componentes principales de `src/features/progreso/`:

| Componente | Función |
|---|---|
| `ProgresoPage.jsx` | Carga los datos, maneja carga/error/reintento y elige la vista según la actividad y el diagnóstico |
| `components/ResumenKpis.jsx` | Nivel general, porcentaje general, ejercicios completados e intentos |
| `components/AvisoEvaluacionParcial.jsx` | Explica el umbral de consolidación y qué dimensiones siguen pendientes |
| `components/GraficaDimensiones.jsx` | Gráfica de barras Recharts y tabla semántica con aciertos, porcentaje, nivel, diagnóstico y variación |
| `components/GraficaTendenciaSemanal.jsx` | Gráfica de línea Recharts y tabla accesible de resultados por semana |
| `components/EstadoSinActividad.jsx` | Estado inicial sin diagnóstico ni intentos de práctica, con acceso a practicar |
| `utils/formatearProgreso.js` | Etiquetas y formateo de niveles, porcentajes y variaciones sin convertir valores nulos en cero |

#### Escenarios que muestra el dashboard

- **Cargando:** presenta el indicador de carga mientras se consulta el backend.
- **Error:** muestra el mensaje de la API cuando está disponible y un botón **Reintentar**; el reintento vuelve a consultar el endpoint.
- **Sin diagnóstico y sin intentos de práctica:** muestra un estado neutral, no representa la ausencia de datos como 0 % de rendimiento y ofrece ir a Práctica.
- **Diagnóstico registrado, pero sin práctica:** muestra el aviso de diagnóstico inicial, los resultados por dimensión y los KPI. Los porcentajes de práctica no evaluados quedan como “Sin evaluar”; ofrece comenzar la práctica.
- **Con intentos de práctica:** presenta los KPI, el rendimiento por dimensión y la tendencia semanal. Si la respuesta marca `evaluacionParcial`, informa qué dimensiones todavía no alcanzan tres intentos evaluados.
- **Sin semanas con actividad:** la sección de tendencia muestra un estado informativo y un acceso a Práctica, sin inventar semanas vacías. Con una sola semana, el gráfico informa que la comparación temporal se verá al acumular actividad posterior.

Los gráficos Recharts están contenidos en `ResponsiveContainer`; cada uno tiene una tabla semántica equivalente para consultar los mismos datos de forma accesible. Las tablas etiquetan sus encabezados y dimensiones. MUI adapta las tarjetas KPI a una columna en pantallas pequeñas, dos en `sm` y cuatro en `md`; los gráficos ocupan el ancho disponible. Los valores nulos se muestran como pendientes/sin evaluar y nunca como 0 %.

`ProtectedRoute` redirige a `/login` si no hay sesión y a `/no-autorizado` si el rol no corresponde. El backend vuelve a validar el rol en cada petición: la protección del frontend es solo de navegación.

Cómo funciona la sesión (`AuthContext`):

- El **rol, el id y el correo salen del token** (claims `rol`, `sub`, `correo`). En `localStorage` se guardan el `token` y, en `usuario`, solo el nombre a mostrar: editar `usuario` a mano no cambia el rol.
- Al abrir la app con una sesión guardada se llama a `GET /api/auth/me`. Con 401 (token alterado, usuario desactivado) o si el rol cambió, se cierra la sesión. Sin conexión con el backend, se conserva.
- La sesión se cierra sola al vencer el token, ante un 401 de cualquier petición, al cerrarla en otra pestaña y si el navegador muestra con "Atrás" una página guardada en su caché.

Registro: las reglas de `features/auth/reglasRegistro.js` deben coincidir con `RegistroRequest.java` y `ProgramaAcademico.java` del backend (el backend es la fuente de verdad). El registro está cerrado: `/registro` sin `?token=` muestra un aviso y no permite crear la cuenta.

### Invitaciones de estudiantes

El docente entra a `/docente/estudiantes`, elige un grupo y carga un CSV con columnas `correo;nombres;apellidos` (también se acepta coma). La tabla muestra el estado `Invitado`, `Registrado` o `Vencida` y permite reenviar el enlace. El estudiante abre `/registro?token=…`, ve el grupo y el correo precargados, elige su programa y crea la cuenta; al registrarse queda inscrito en el grupo y la invitación se marca como usada.

## 7. Convenciones de código

- Componentes en `PascalCase.jsx`, un componente por archivo; hooks en `useAlgo.js`; utilidades en `camelCase.js`.
- Componentes de función y hooks; nada de componentes de clase.
- Estilos con MUI (`sx` o el tema); nada de colores sueltos: usa los del `theme`.
- Notación matemática siempre con el componente `MathText` (KaTeX), nunca como texto plano ni imagen: `<MathText texto="Deriva $f(x) = \frac{x^2}{3}$" />`. Fórmulas en línea entre `$…$`, en bloque entre `$$…$$`, y `\$` para un signo de pesos. Con `npm run dev`, la página http://localhost:5173/dev/mathtext muestra ejemplos y permite probar cualquier texto.
- Accesibilidad (RNF-05, WCAG 2.1 AA): cada input con `label`, imágenes con `alt`, todo navegable con teclado, contraste suficiente. MUI ayuda, pero no lo garantiza solo.
- Mientras un endpoint no exista, usa datos simulados en el archivo de `api/` correspondiente, con la misma forma que el contrato acordado en Jira.

## 8. Responsables por módulo

| Módulo | Responsable principal |
|---|---|
| Configuración base, `routes/`, `layouts/`, `theme/`, staging | Nicolás Pérez |
| `features/auth/`, `ProtectedRoute`, `context/` | Fernando Pérez |
| `features/diagnostico/`, `features/practica/` | Nicolás Pérez |
| `features/progreso/`, dashboard en `features/docente/` | Fernando Pérez |
| `features/admin/` (panel general) | Nicolás Pérez |

## 9. Problemas frecuentes

| Síntoma | Causa probable / solución |
|---|---|
| `Network Error` en todas las peticiones | Backend apagado, o `VITE_API_URL` mal escrita |
| Error de CORS en la consola | El backend no tiene `http://localhost:5173` en `CORS_ORIGINS` |
| Cambié `.env.development` y no pasa nada | Reinicia `npm run dev`; Vite solo lee `.env` al arrancar |
| Me saca al login a cada rato | El token expiró (120 min en desarrollo) |
| `npm install` falla | Revisa tu versión de Node con `node -v` |
| Una prueba falla mostrando un objeto `{ response: … }` que el componente sí atrapa | Un `beforeEach` devuelve la función simulada (ver "Pruebas") |
| `git status` muestra cambios en `dist/` | `dist/` es el resultado del build y no se versiona; ya está en `.gitignore` |
