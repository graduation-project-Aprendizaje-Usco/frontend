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
| [Accesibilidad](#7-accesibilidad-scrum-52) | SCRUM-52 | Nicolás Pérez | En `feature/accesibilidad` (falta lo que salga del piloto) |
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

## 7. Accesibilidad (SCRUM-52)

**Para qué.** Cumplir WCAG 2.1 AA en las pantallas principales: **Lighthouse Accessibility ≥ 90** y **todo operable con teclado**. Lo que salga del piloto con usuarios (SCRUM-50) se agrega aquí.

**Cómo se midió.** Lighthouse 12 con sesión real (estudiante y docente), en dos pasadas:

1. Cada pantalla recién cargada: login, registro, inicio del estudiante y del docente, instrucciones y prueba del diagnóstico, práctica y Mi progreso.
2. Los estados que solo aparecen al interactuar, que Lighthouse no ve al cargar: error del login, registro con errores, retroalimentación de la práctica, resultado del diagnóstico e historial con datos.

Además se recorrió cada pantalla con Tab: orden del foco, foco visible y que no se pierda.

**Resultado.** Antes de los ajustes, 96 en la retroalimentación de la práctica y en el resultado del diagnóstico; 100 en lo demás. Después, **100 en las 13 pantallas y estados**, y el foco visible en todas.

| Hallazgo | Arreglo |
|---|---|
| Práctica: al pulsar «Comprobar respuesta» el botón desaparece y el foco caía al inicio de la página | El foco pasa a la retroalimentación; con «Intentar de nuevo» vuelve al enunciado |
| Práctica y diagnóstico: con la pregunta ya respondida, «Elige una respuesta» y las opciones quedaban en gris 2.7:1 | En el tema, los textos deshabilitados de formularios usan el gris secundario (6.4:1) |
| Resultado del diagnóstico: el gráfico estaba oculto a lectores de pantalla (`aria-hidden`), pero recharts lo hacía enfocable con Tab | `accessibilityLayer={false}`: la tabla de abajo ya tiene los mismos datos |
| Las alertas salían casi blancas y no se distinguía su tipo (pendiente desde el login) | En el tema, para todas: fondo claro, borde e icono del color y texto oscuro (≥ 12:1). Se quitó el estilo propio que tenían login y registro |

**Pruebas.** `PracticaPage.test.jsx` verifica que el foco va a la retroalimentación y vuelve al enunciado.

**Falta.** Medir los dashboards (SCRUM-38 y SCRUM-40) cuando existan, y corregir lo que encuentre el piloto. Los scripts de la auditoría están en la carpeta de evidencias (`evidencias/SCRUM-52-accesibilidad/`) para repetirla.

---

## Pendientes conocidos

- **Dashboard del docente (SCRUM-40):** espera los indicadores de grupo del backend (SCRUM-39).
- **Historial (SCRUM-41):** espera el registro de intentos de práctica (SCRUM-35).
