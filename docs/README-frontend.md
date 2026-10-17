# Aprendizaje USCO — Frontend

[![CI](https://github.com/aprendizaje-usco-project/aprendizaje-usco-frontend/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/aprendizaje-usco-project/aprendizaje-usco-frontend/actions/workflows/ci.yml?query=branch%3Adevelop)

Interfaz web de **Aprendizaje USCO**, plataforma de diagnóstico, práctica adaptativa y analítica de aprendizaje para Cálculo Diferencial (Proyecto Integrador II, Ingeniería de Software, Universidad Surcolombiana).

| | |
|---|---|
| Stack | React 19 · Vite 8 · React Router 7 · MUI · Axios · Recharts · KaTeX |
| Backend | [aprendizaje-usco-backend](https://github.com/aprendizaje-usco/aprendizaje-usco-backend) |
| Tablero | Jira, proyecto `AU` |
| Convenciones | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## 1. Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 24 LTS (mínimo 22.12) |
| npm | el que trae Node |
| Backend corriendo | ver el README del backend (puerto 8080) |

## 2. Cómo correrlo en local

```bash
git clone https://github.com/aprendizaje-usco/aprendizaje-usco-frontend.git
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
| `npm run format` | Prettier sobre `src/` |

Antes de abrir un PR: `npm run lint` y `npm run build` sin errores.

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
├── routes/           AppRouter.jsx, ProtectedRoute.jsx
├── context/          AuthContext.jsx (usuario, rol, login, logout)
├── layouts/          EstudianteLayout, DocenteLayout, AdminLayout
├── features/
│   ├── auth/         login
│   ├── diagnostico/  prueba de 24 ítems, resultado
│   ├── practica/     ejercicios, retroalimentación
│   ├── progreso/     dashboard e historial del estudiante
│   ├── docente/      dashboard docente, gestión de actividades
│   └── admin/        usuarios y roles
├── components/       reutilizables: MathText, BarraProgreso, Temporizador…
├── theme/            theme.js con los colores institucionales
└── utils/
```

Reglas:

- Cada pantalla vive en su carpeta de `features/`. Lo que usan dos o más módulos pasa a `components/`.
- Las llamadas HTTP **solo** se hacen desde `api/`; los componentes nunca usan `axios` directamente.
- El prototipo HTML es la referencia visual de cada pantalla.

## 6. Rutas y roles

| Ruta | Rol | Pantalla |
|---|---|---|
| `/login` | público | Inicio de sesión |
| `/estudiante` | ESTUDIANTE | Inicio del estudiante |
| `/estudiante/diagnostico` | ESTUDIANTE | Prueba diagnóstica |
| `/estudiante/practica` | ESTUDIANTE | Ejercicios adaptativos |
| `/estudiante/progreso` | ESTUDIANTE | Dashboard e historial |
| `/docente` | DOCENTE | Dashboard de desempeño del grupo |
| `/docente/actividades` | DOCENTE | Gestión de actividades y contenidos |
| `/admin` | ADMIN | Usuarios y roles |
| `/no-autorizado` | cualquiera | Acceso denegado |

`ProtectedRoute` redirige a `/login` si no hay sesión y a `/no-autorizado` si el rol no corresponde. El backend vuelve a validar el rol en cada petición: la protección del frontend es solo de navegación.

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
| `features/auth/`, `ProtectedRoute` | Fernando Pérez |
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
