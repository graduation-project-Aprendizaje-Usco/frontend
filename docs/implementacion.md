# Implementación del frontend

Qué pantallas y piezas se han construido, para qué sirven, qué decisiones se tomaron y cómo probarlas, **historia por historia**. Complementa al [README](README-frontend.md) (cómo correr el proyecto y las convenciones). La API y la seguridad están en `docs/implementacion.md` del backend.

Se actualiza con cada historia que entra a `develop`.

| Historia | Jira | Responsable | Estado |
|---|---|---|---|
| [Inicio de sesión](#1-inicio-de-sesión-scrum-16) | SCRUM-16 (86, 87) | Nicolás Pérez | En `develop` |
| [Sesión y rutas protegidas](#2-sesión-y-rutas-protegidas-scrum-12) | SCRUM-12 (89, 90) | Fernando Pérez (implementación: Nicolás Pérez) | En `develop` |
| [Componente MathText](#3-componente-mathtext-scrum-160) | SCRUM-160 | Nicolás Pérez | En `develop` |
| [Prueba diagnóstica](#4-prueba-diagnóstica-scrum-25) | SCRUM-25 (134–139) | Nicolás Pérez | En `develop` |
| [Resultado del diagnóstico](#5-resultado-del-diagnóstico-scrum-26) | SCRUM-26 (140–142) | Nicolás Pérez | En `develop` |
| [Práctica adaptativa y retroalimentación](#6-práctica-adaptativa-y-retroalimentación-110-114) | 110, 114 | Juan David Polanco (interfaz base: Fernando Pérez) | En `develop` |
| [Historial de resultados](#7-historial-de-resultados-scrum-41) | SCRUM-41 (169) | Nicolás Pérez | En `feature/historial` |
| Registro de estudiantes | — (revisión de autenticación) | Jorel Vargas | En `develop` |

---

## 1. Inicio de sesión (SCRUM-16)

**Para qué.** La pantalla con la que todos entran: correo y contraseña, y luego al inicio de su rol.

| Archivo | Qué hace |
|---|---|
| `features/auth/LoginPage.jsx` | Formulario con `react-hook-form` + `zod`, mostrar/ocultar contraseña, error del servidor, redirección al rol. Referencia: prototipos 01 y 02 |
| `api/authApi.js` | `login()`, `registro()` y `me()` contra `/api/auth` |
| `api/mocks/authMock.js` | Respuestas simuladas con la misma forma del contrato, activadas con `VITE_USE_MOCKS=true` |
| `api/errores.js` | `mensajeDeError()`: convierte cualquier error de la API en un texto para el usuario |

**Decisiones.**

- **Se quitó «Olvidé mi contraseña»** del prototipo: esa función no está en ninguna tarea y un enlace que no hace nada confunde.
- **Colores de la alerta de error ajustados solo en esta pantalla:** con el tema actual, las alertas de MUI salen casi blancas. Pendiente corregirlo en `theme/` para todas.
- **Accesible:** labels visibles, errores enlazados con `aria-describedby`, foco al primer error, alerta con `role="alert"`, uso completo con teclado y diseño a 375 px.

**Pruebas.** `LoginPage.test.jsx`.

---

## 2. Sesión y rutas protegidas (SCRUM-12)

**Para qué.** Mantener la sesión al recargar, cerrarla cuando el token vence y no dejar entrar a pantallas de otro rol.

| Archivo | Qué hace |
|---|---|
| `context/AuthContext.jsx` | Lee el token con `jwt-decode`; el id, el correo y el **rol salen del token** (no de lo guardado en el navegador). Al abrir la app confirma la sesión con `GET /api/auth/me`. Se cierra al vencer el token, ante un 401 del backend, o si se cerró en otra pestaña |
| `api/client.js` | Pone el token en cada petición; ante un 401 (salvo en login y registro) avisa a `AuthContext` para cerrar la sesión |
| `routes/ProtectedRoute.jsx` | Sin sesión → `/login` recordando la ruta de origen; rol distinto → `/no-autorizado` |

**Decisión.** Después del login se vuelve a la ruta que se intentaba abrir **solo si es del rol del usuario**; si no, al inicio del rol.

**Pruebas.** `AuthContext.test.jsx` y `ProtectedRoute.test.jsx` (de la revisión de Jorel).

---

## 3. Componente MathText (SCRUM-160)

**Para qué.** Mostrar bien la notación matemática en preguntas, ejercicios y retroalimentación.

```jsx
<MathText texto="Deriva $f(x) = \frac{x^2}{3}$" />
```

- `$…$` en línea, `$$…$$` en bloque, `\$` para un signo de pesos (`utils/textoMatematico.js`).
- Una fórmula mal escrita muestra su texto original y el resto sigue normal.
- Genera MathML para lectores de pantalla; las fórmulas largas se desplazan dentro de su caja en celular.
- Página de prueba solo en desarrollo: http://localhost:5173/dev/mathtext (no entra en el build).

---

## 4. Prueba diagnóstica (SCRUM-25)

**Para qué.** Que el estudiante presente los 24 ítems con tiempo, viendo su avance y sin perder respuestas.

**Flujo.** `DiagnosticoPage` pide `GET /api/diagnosticos/intentos/actual`:

| Estado del intento | Qué muestra |
|---|---|
| No existe | Instrucciones con autorización de datos (Ley 1581) y «Comenzar la prueba» |
| EN_CURSO | Instrucciones con «Continuar la prueba» → la prueba, en el primer ítem sin responder |
| FINALIZADO | El resultado (la prueba se presenta **una sola vez**) |

| Archivo | Subtarea | Qué hace |
|---|---|---|
| `api/diagnosticoApi.js` | 134 | `actual`, `iniciar`, `obtener`, `responder`, `finalizar`, `resultado` (contrato de SCRUM-106, README-backend §12) |
| `InstruccionesDiagnostico.jsx` | 135 | Prototipo 06: ítems, tiempo, dimensiones, autorización |
| `ItemDiagnostico.jsx` | 136 | Enunciado y opciones con MathText, imagen con texto alternativo (ítems 17 a 19), opciones con flechas, «Guardando… / Respuesta guardada / Reintentar» |
| `PruebaDiagnostico.jsx` | 137–139 | Temporizador, progreso x/24, Anterior/Siguiente, mapa de ítems, aviso «Saltar ítem», confirmación al finalizar |

**Decisiones.**

- **El tiempo lo controla el servidor:** el reloj arranca con `segundosRestantes`, avisa a los 5 minutos y en 0 entrega la prueba sola.
- **Cada respuesta se guarda al elegirla.** Si falla, la opción queda marcada y aparece «Reintentar»; un 409/422 (tiempo agotado) entrega la prueba.
- **«Siguiente» sin responder** muestra un aviso y ofrece «Saltar ítem» (prototipo 08). Se agregó tras la verificación de CA-02 (caso PV-01).
- **La confirmación de finalizar** dice cuántos ítems faltan y pone el foco en «Seguir respondiendo», para no entregar por error.
- **Sin datos simulados** para el diagnóstico: el backend ya existía cuando se construyó.

---

## 5. Resultado del diagnóstico (SCRUM-26)

**Para qué.** Que el estudiante vea su puntaje, su categoría y en qué dimensiones reforzar, con acceso directo a la práctica.

`ResultadoDiagnostico.jsx` (prototipo 09) recibe el `resultado` tal cual lo entrega el backend:

| Subtarea | Qué muestra |
|---|---|
| 140 | Puntaje x/24 y categoría con color **+ icono + texto** (nunca solo color) |
| 141 | Barras de % de aciertos por dimensión (recharts) con el valor en cada barra, y una **tabla equivalente** para lectores de pantalla |
| 142 | Dimensiones sin nivel alto para reforzar y botón «Empezar a practicar» → `/estudiante/practica` |

**Decisiones.**

- El gráfico usa un solo color: las barras se distinguen por su nombre, no por color.
- Una barra en 0 % igual se dibuja (2 px) para que muestre su etiqueta «0 %».
- Las recomendaciones son por nivel de cada dimensión; el backend no entrega detalle por tema (como «factorización»).

**Pruebas de 4 y 5.** `DiagnosticoPage.test.jsx`: 12 pruebas (comenzar, continuar y retomar, guardar y reintentar, «Saltar ítem», confirmar al finalizar, entrega por tiempo, resultado, tabla, recomendaciones).

**Cómo probarlo a mano.** Registrar un estudiante en `/registro` (correo `u` + 11 dígitos + `@usco.edu.co`), entrar a **Diagnóstico** y presentar la prueba. Para repetirla hace falta otro estudiante.

---

## 6. Práctica adaptativa y retroalimentación (110, 114)

**Para qué.** Que el estudiante resuelva ejercicios uno tras otro y reciba, en la misma respuesta del servidor, si acertó y qué hacer para entender el procedimiento. El intento se registra una sola vez aunque el navegador lo reenvíe.

| Archivo | Subtarea | Qué hace |
|---|---|---|
| `api/practicaApi.js` | 105 | `siguiente()` y `responder()` contra `/api/practica`; deja pasar el error HTTP para distinguir un 404 de un fallo de red |
| `PracticaPage.jsx` | 106–108, 113 | Enunciado con MathText, opción múltiple o respuesta numérica, estado de envío, pista antes de responder, reintento del segundo intento y botón para el siguiente ejercicio |
| `PanelRetroalimentacion.jsx` | 111–112 | Panel bajo el ejercicio con pista o explicación, error común en MathText, `aria-live`, foco al aparecer y aviso de que el segundo fallo fue el último intento |

**Decisiones.**

- **El feedback lo decide el backend.** El frontend no arma textos: muestra `retroalimentacion.tipo`, `texto` y `errorComun` tal como llegan en `POST /api/practica/intentos`.
- **Pista antes de responder:** el botón «Ver pista» revela la pista del ejercicio y envía `pistaUsada: true` en el intento.
- **Idempotencia en el navegador:** se genera un UUID al preparar el envío y se conserva si la petición falla; al reintentar se envía la misma clave. Tras una respuesta confirmada se descarta, para que el segundo intento pedagógico use una clave nueva.
- **Doble clic:** un bloqueo síncrono evita lanzar dos peticiones mientras el backend confirma. El backend también protege la clave de idempotencia ante envíos simultáneos.
- **Accesibilidad:** el panel usa `role="status"`, `aria-live="polite"` y recibe el foco al aparecer; el resultado no depende solo del color.

**Pruebas.** `PracticaPage.test.jsx` (carga, acierto, primer fallo, segundo fallo sin reintento, respuesta numérica, reintento de red con la misma clave, doble clic, teclado, 404 y pista), `PanelRetroalimentacion.test.jsx` (pista, explicación, acierto y ausencia de feedback) y `practicaApi.test.js` (contrato).

**Cómo probarlo a mano.** Entrar como estudiante, abrir **Práctica**, pedir una pista, responder mal una vez (debe aparecer «Pista»), pulsar «Intentar de nuevo», volver a fallar (debe aparecer «Explicación» y el aviso del último intento) y comprobar que el siguiente ejercicio carga sin recargar.

---

## 7. Historial de resultados (SCRUM-41)

**Para qué.** Que el estudiante vea en **Mi progreso** todo lo que ha hecho (diagnóstico y ejercicios de práctica), y que el docente pueda ver el de un estudiante de sus grupos.

| Archivo | Qué hace |
|---|---|
| `api/historialApi.js` | `consultar(filtros)` contra `GET /api/historial`; no envía los filtros vacíos |
| `components/HistorialResultados.jsx` | Filtros (actividad, competencia, desde, hasta), tabla y paginación de 20 en 20 |
| `features/progreso/ProgresoPage.jsx` | Muestra el historial del estudiante en `/estudiante/progreso` |

**Reutilizable** (por eso está en `components/`):

```jsx
<HistorialResultados />                    // estudiante: su propio historial
<HistorialResultados estudianteId={id} />  // docente: un estudiante de sus grupos
```

**Qué muestra cada fila:** fecha, tipo y actividad, competencia y resultado. En el diagnóstico, «16 de 24 · Riesgo moderado»; en la práctica, «Correcto» o «Incorrecto» con icono y texto (nunca solo color), y debajo el nivel, el tiempo y si usó pista.

**Decisiones.**

- Al cambiar un filtro se vuelve a la primera página.
- Sin resultados se dice «No hay actividades con estos filtros» en vez de mostrar una tabla vacía; el conteo se anuncia con `aria-live`.
- Los filtros se reparten en las filas que hagan falta, y la tabla se desplaza dentro de su recuadro en celular.
- **Mi progreso** de momento solo tiene el historial: los indicadores del dashboard de progreso (SCRUM-38, Fernando) van arriba de él.

**Pruebas.** `HistorialResultados.test.jsx`: 6 pruebas (filas de ambos tipos, filtros, paginación, estado vacío, docente con `estudianteId`, error del backend).

**Cómo probarlo a mano.** Con un estudiante que haya presentado el diagnóstico y resuelto ejercicios en **Práctica**, entrar a **Mi progreso** y probar los filtros.

---

## Pendientes conocidos

- **Dashboard del docente (SCRUM-40):** espera los indicadores de grupo del backend (SCRUM-39). Cuando exista el detalle del estudiante, reutilizará `<HistorialResultados estudianteId={id} />`.
- **Alertas del tema:** corregir los colores de `MuiAlert` en `theme/theme.js` para todas las pantallas.
