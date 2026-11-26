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
| [Historial de resultados](#7-historial-de-resultados-scrum-41) | SCRUM-41 (169) | Nicolás Pérez | En `develop` |
| [Accesibilidad](#8-accesibilidad-scrum-52) | SCRUM-52 | Nicolás Pérez | En `develop` (falta lo que salga del piloto) |
| [Dashboard del docente](#9-dashboard-del-docente-scrum-40) | SCRUM-40 (124) | Nicolás Pérez (implementación: Juan David Polanco) | En `develop` |
| [Actividades y contenidos](#10-actividades-y-contenidos-scrum-43) | SCRUM-43 (132) | Juan David Polanco | En `develop` |
| [Administración de usuarios](#11-administración-de-usuarios-scrum-45) | SCRUM-45 (109) | Jorel Vargas (implementación: Nicolás Pérez) | En `develop` |
| [Panel del administrador](#12-panel-del-administrador-scrum-46) | SCRUM-46 | Fernando Pérez (implementación: Nicolás Pérez) | En `develop` · verificado |
| [Grupos y actividades del administrador](#13-grupos-y-actividades-del-administrador-scrum-46) | SCRUM-46 | Fernando Pérez (implementación: Nicolás Pérez) | En `develop` |
| [Integración end-to-end](#14-integración-end-to-end-140) | 140 | Juan David Polanco | Verificado en local; staging pendiente |
| [Registro por invitación](#15-registro-por-invitación-150) | 150 | Jorel Vargas | En `develop` |
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
- En **Mi progreso** el historial va debajo del dashboard de progreso (SCRUM-38, Fernando). No se muestra si el estudiante aún no tiene diagnóstico ni práctica, porque la página ya muestra el estado sin actividad.

**Pruebas.** `HistorialResultados.test.jsx`: 6 pruebas (filas de ambos tipos, filtros, paginación, estado vacío, docente con `estudianteId`, error del backend).

**Cómo probarlo a mano.** Con un estudiante que haya presentado el diagnóstico y resuelto ejercicios en **Práctica**, entrar a **Mi progreso** y probar los filtros.

---

## 8. Accesibilidad (SCRUM-52)

**Para qué.** Cumplir WCAG 2.1 AA en las pantallas principales: **Lighthouse Accessibility ≥ 90** y **todo operable con teclado**. Lo que salga del piloto con usuarios (SCRUM-50) se agrega aquí.

**Cómo se midió.** Lighthouse 12 con sesión real (estudiante y docente), en dos pasadas:

1. Cada pantalla recién cargada: login, registro, inicio del estudiante y del docente, instrucciones y prueba del diagnóstico, práctica y Mi progreso.
2. Los estados que solo aparecen al interactuar, que Lighthouse no ve al cargar: error del login, registro con errores, retroalimentación de la práctica, resultado del diagnóstico e historial con datos.

Además se recorrió cada pantalla con Tab: orden del foco, foco visible y que no se pierda.

**Resultado.** Antes de los ajustes, 96 en la retroalimentación de la práctica y en el resultado del diagnóstico; 100 en lo demás. Después, **100 en las 13 pantallas y estados**, y el foco visible en todas.

| Hallazgo | Arreglo |
|---|---|
| Práctica: al pulsar «Comprobar respuesta» el botón desaparece y el foco caía al inicio de la página | Lo resolvió en paralelo el panel de retroalimentación de Juan David (110, sección 6), con la misma solución: el foco pasa al panel y con «Intentar de nuevo» vuelve al enunciado |
| Práctica y diagnóstico: con la pregunta ya respondida, «Elige una respuesta» y las opciones quedaban en gris 2.7:1 | En el tema, los textos deshabilitados de formularios usan el gris secundario (6.4:1) |
| Resultado del diagnóstico: el gráfico estaba oculto a lectores de pantalla (`aria-hidden`), pero recharts lo hacía enfocable con Tab | `accessibilityLayer={false}`: la tabla de abajo ya tiene los mismos datos |
| Las alertas salían casi blancas y no se distinguía su tipo (pendiente desde el login) | En el tema, para todas: fondo claro, borde e icono del color y texto oscuro (≥ 12:1). Se quitó el estilo propio que tenían login y registro |

**Pruebas.** El foco de la práctica lo verifican `PanelRetroalimentacion.test.jsx` y `PracticaPage.test.jsx` (sección 6).

**Dashboard de progreso (SCRUM-38).** Se midió al integrarlo: 95, porque sus dos gráficas ocultas recibían el foco con Tab. Con el mismo arreglo (`accessibilityLayer={false}`) quedó en **100**.

**Pantallas del docente (SCRUM-40 y actividades).** Se midieron al integrarlas, con un grupo de prueba que tenía un estudiante con práctica: dashboard (también a 375 px), diálogos de crear grupo e inscribir, detalle del estudiante, actividades (ejercicios y contenidos) y los diálogos de nuevo ejercicio y nuevo contenido. Antes: 96 en el dashboard y en el detalle, 98 en el diálogo de ejercicio; 100 en lo demás. Después, **100 en las 9**, el foco visible y sin desborde a 375 px.

| Hallazgo | Arreglo |
|---|---|
| Dashboard: la gráfica de categorías está oculta (`aria-hidden`), pero su `Pie` recibía el foco con Tab | `rootTabIndex={-1}` en el `Pie`: en recharts 3 es enfocable por defecto aunque `accessibilityLayer` esté apagado |
| Detalle del estudiante: el panel lateral (`role="dialog"`) no tenía nombre accesible | MUI 9 ya no aplica `PaperProps`; se pasó a `slotProps.paper`, con el `aria-labelledby` del título |
| Diálogo de ejercicio: el subtítulo «Opciones» era un `h6` justo después del `h2` del diálogo | `component="h3"` |
| Práctica y diálogo de ejercicio: MUI 9 ignora `inputProps`, así que el campo numérico de práctica no abría el teclado numérico en el celular y los campos de respuesta y tolerancia del docente no aceptaban decimales | Se pasó a `slotProps.htmlInput`. `PracticaPage.test.jsx` ahora verifica `inputmode="decimal"` |

**Falta.** Corregir lo que encuentre el piloto (SCRUM-50). Los scripts de la auditoría están en la carpeta de evidencias (`evidencias/SCRUM-52-accesibilidad/`) para repetirla.

---

## 9. Dashboard del docente (SCRUM-40)

**Para qué.** Que el docente consulte el desempeño de sus grupos, identifique estudiantes en riesgo y revise el detalle y el historial de cada estudiante.

| Archivo | Qué hace |
|---|---|
| `api/gruposApi.js` | `listar()`, `crear()` e `inscribir()` contra `/api/grupos` |
| `api/analiticaApi.js` | `obtenerResumenGrupo()` y `obtenerDetalleEstudiante()` contra `/api/analitica/grupos` |
| `features/docente/InicioDocentePage.jsx` | Dashboard: selector de grupo, filtros, resumen, riesgo, tabla y diálogos |
| `features/docente/components/SelectorGrupo.jsx` | Selector de los grupos del docente |
| `features/docente/components/FiltrosGrupo.jsx` | Competencia y rango de fechas (“Periodo desde/hasta”) |
| `features/docente/components/ResumenKpisGrupo.jsx` | Estudiantes, actividad, promedio general y estudiantes en riesgo |
| `features/docente/components/GraficaDimensionesGrupo.jsx` | Barras por dimensión y tabla accesible equivalente |
| `features/docente/components/GraficaCategorias.jsx` | Distribución de categorías con tabla accesible |
| `features/docente/components/DimensionMasDebil.jsx` | Dimensión con menor promedio del grupo |
| `features/docente/components/GraficaEvolucionGeneral.jsx` | Evolución semanal con tabla accesible |
| `features/docente/components/TablaEjerciciosErrores.jsx` | Top 5 de ejercicios con más errores |
| `features/docente/components/TablaEstudiantes.jsx` | Tabla ordenable, búsqueda y acceso al detalle |
| `features/docente/components/DetalleEstudianteDrawer.jsx` | Detalle del estudiante e historial reutilizado |
| `features/docente/components/CrearGrupoDialog.jsx` | Crear grupo cuando no existe |
| `features/docente/components/InscribirEstudianteDialog.jsx` | Inscribir estudiante por correo |

**Decisiones.**

- **Periodo como rango de fechas:** no se agregó `grupo.periodo`; el backend filtra los intentos con `desde`/`hasta`.
- **Riesgo:** último diagnóstico `ALTO_RIESGO` o promedio de práctica menor al 50 %; la falta de actividad se muestra aparte.
- **Detalle en Drawer:** evita duplicar la tabla y reutiliza `<HistorialResultados estudianteId={id} />` de SCRUM-41.
- **Filtros en la URL:** `grupo`, `competencia`, `desde`, `hasta` y `estudiante` se sincronizan con `useSearchParams`.
- **Crear e inscribir desde el dashboard:** el backend ya estaba listo, así que el flujo queda completo sin salir de la pantalla.
- **Accesibilidad:** tablas con encabezados, gráficos ocultos a lectores de pantalla con tabla equivalente, foco visible y controles con etiqueta.

**Pruebas.** `InicioDocentePage.test.jsx` (6 pruebas: resumen, detalle, filtros, crear grupo, inscribir y error), `gruposApi.test.js` y `analiticaApi.test.js`. Resultado: **106 pruebas** en total, `npm run lint` y `npm run build` sin errores.

**Cómo probarlo a mano.** Entrar como `docente@aprendizaje.test` / `Docente2026*`, crear o seleccionar un grupo, inscribir estudiantes, cambiar competencia y fechas, ordenar la tabla y abrir “Ver detalle”.

El dashboard incluye ahora los indicadores derivados: dimensión más débil, top 5 de ejercicios con más errores y evolución semanal del grupo.

---

## 10. Actividades y contenidos (SCRUM-43)

**Para qué.** Que el docente cree, edite, active/desactive y elimine sus contenidos y ejercicios de práctica.

| Archivo | Qué hace |
|---|---|
| `api/contenidosApi.js` | Listar, crear, actualizar, cambiar estado y eliminar contenidos |
| `api/ejerciciosApi.js` | Listar, crear, actualizar, cambiar estado y eliminar ejercicios |
| `features/docente/ActividadesPage.jsx` | Pantalla con pestañas de ejercicios y contenidos |
| `features/docente/actividades/ContenidosTab.jsx` | Filtros y tabla de contenidos |
| `features/docente/actividades/EjerciciosTab.jsx` | Filtros y tabla de ejercicios |
| `features/docente/actividades/ContenidoFormDialog.jsx` | Formulario de contenido |
| `features/docente/actividades/EjercicioFormDialog.jsx` | Formulario de ejercicio con vista previa y validación |
| `features/docente/actividades/ConfirmarEliminacionDialog.jsx` | Confirmación y opción de desactivar si hay dependencias |

**Decisiones.**

- **Formularios con `react-hook-form` + `zod`**, con validación de cuatro opciones y una única correcta.
- **Vista previa MathText** del enunciado y las opciones mientras se edita.
- **Confirmación de borrado:** si el backend responde 409, el diálogo muestra el motivo y ofrece “Desactivar en su lugar”.
- **Contenido y competencia inmutables** después de crear el ejercicio; el código solo se puede definir al crear.
- **El motor respeta `activo`:** las pruebas de backend verifican que un ejercicio desactivado deja de aparecer.

**Pruebas.** `ActividadesPage.test.jsx` (6 pruebas: pestañas, crear contenido, crear ejercicio, editar, activar/eliminar y desactivar tras 409) y `actividadesApi.test.js` (clientes de contenidos y ejercicios).

**Cómo probarlo a mano.** Entrar como docente, abrir `/docente/actividades`, crear un contenido, crear un ejercicio, iniciar sesión como estudiante y comprobar que aparece en Práctica. Luego desactivarlo y verificar que desaparece.

## 11. Administración de usuarios (SCRUM-45)

**Para qué.** Pantalla `/admin/usuarios` para que el administrador cree, edite, cambie el rol y desactive cuentas.

| Archivo | Qué hace |
|---|---|
| `api/adminUsuariosApi.js` | `listar()`, `crear()`, `actualizar()` y `cambiarEstado()` contra `/api/admin/usuarios` |
| `features/admin/UsuariosPage.jsx` | Búsqueda, filtros por rol y estado, tabla, y acciones de editar, activar y desactivar (con confirmación) |
| `features/admin/UsuarioFormDialog.jsx` | Formulario de crear o editar; al crear muestra la contraseña temporal una sola vez |

**Decisiones.**

- **Mismas reglas que el backend:** si el rol es Estudiante, el formulario exige correo de estudiante y programa académico (reutiliza `reglasRegistro.js`).
- **El administrador no puede desactivarse ni cambiarse el rol:** el botón y el selector aparecen deshabilitados para su propia cuenta; el backend también lo impide.
- **El correo no se edita:** identifica la cuenta.
- **«Roles y permisos» sigue en construcción:** los tres roles son fijos y el rol se cambia desde cada usuario.

**Accesibilidad.** Lighthouse 100 en la pantalla (también a 375 px) y en los diálogos de crear, editar y confirmar; foco visible en todas las paradas de Tab. El texto de ayuda de los campos deshabilitados salía en gris 2.7:1 en el diálogo de editar; en el tema ahora usa el gris secundario, igual que las etiquetas deshabilitadas (sección 8).

**Pruebas.** `UsuariosPage.test.jsx`: 6 pruebas (filtros, crear con contraseña temporal, validación de estudiante, editar rol, confirmar desactivación y no desactivarse a uno mismo, reactivar).

**Cómo probarlo a mano.** Entrar como `admin@aprendizaje.test` / `Admin2026*` → **Usuarios** → crear un docente, copiar la contraseña temporal e iniciar sesión con ella en otra ventana.

## 12. Panel del administrador (SCRUM-46)

**Para qué.** Inicio del administrador (`/admin`) con los conteos reales de la plataforma y accesos a la gestión.

| Archivo | Qué hace |
|---|---|
| `features/admin/InicioAdminPage.jsx` | Tarjetas de estudiantes, docentes y administradores (total y activos), grupos, contenidos activos y ejercicios activos |
| `api/adminUsuariosApi.js` | `obtenerResumen()` contra `GET /api/admin/resumen` |
| `features/admin/UsuariosPage.jsx` | Acepta `?rol=` en la URL para abrir con ese filtro |

**Decisiones.**

- **Enlaces a las pantallas de gestión:** cada rol enlaza a Usuarios ya filtrado (por ejemplo, «Ver docentes» → `/admin/usuarios?rol=DOCENTE`); grupos, contenidos y ejercicios enlazan a las vistas de la sección 13.
- **Cada tarjeta es una región con nombre** (`aria-label`), así un lector de pantalla las recorre como secciones.

**Pruebas.** `InicioAdminPage.test.jsx`: 3 pruebas (conteos y enlaces, error al cargar, Usuarios abre con el filtro del enlace).

## 13. Grupos y actividades del administrador (SCRUM-46)

**Para qué.** Completar el panel con vistas de solo lectura para que los conteos de grupos, contenidos y ejercicios tengan una pantalla a la que llegar.

| Archivo | Qué hace |
|---|---|
| `features/admin/GruposAdminPage.jsx` | Lista los grupos, busca por código/nombre/docente y abre un Drawer con los estudiantes |
| `features/admin/ActividadesAdminPage.jsx` | Muestra contenidos y ejercicios en pestañas, con búsqueda y etiquetas de competencia, nivel y tipo |
| `features/admin/RolesPage.jsx` | Explica los roles y enlaza a Usuarios con el filtro correspondiente; el cambio de rol se hace en la ficha del usuario |
| `api/adminActividadesApi.js` | `obtener()` contra `GET /api/admin/actividades` |
| `api/gruposApi.js` | Agrega `estudiantes(grupoId)` contra `GET /api/grupos/{id}/estudiantes` |
| `routes/AppRouter.jsx` | Rutas `/admin/grupos` y `/admin/actividades` |
| `routes/navegacion.js` | Opciones «Grupos» y «Actividades» en el menú del administrador |

**Decisiones.**

- **Solo lectura:** el administrador consulta, pero la creación y edición siguen siendo del docente; no se duplican formularios.
- **Sin claves:** la tabla de ejercicios muestra código, contenido, competencia, nivel, tipo, docente y estado; nunca la respuesta correcta ni la explicación.
- **Semilla:** los registros sin docente creador se muestran como «Semilla».
- **Pestaña en la URL:** `?tab=ejercicios` permite que el panel abra directamente la lista de ejercicios.

**Pruebas.** `GruposAdminPage.test.jsx` (lista, detalle y búsqueda), `ActividadesAdminPage.test.jsx` (contenidos, ejercicios, pestaña por URL y error), `RolesPage.test.jsx` (roles y enlaces) e `InicioAdminPage.test.jsx` (enlaces).

## 14. Integración end-to-end (140)

**Para qué.** Verificar que el login y los tres flujos comparten los mismos usuarios, roles y datos.

- `/estudiante` ahora muestra el dashboard de progreso que ya existía en `/estudiante/progreso`, para que el login no termine en una página «en construcción».
- El guion manual y la evidencia local están en `docs/pruebas/e2e-sprint-4.md` del backend.
- **Staging pendiente de #33:** la validación se repite cuando exista el entorno.

## 15. Registro por invitación (150)

**Para qué.** Cerrar el registro público y permitir que el docente invite a los estudiantes de su grupo.

| Archivo | Qué hace |
|---|---|
| `features/docente/EstudiantesPage.jsx` | Selector de grupo, carga de CSV (`correo;nombres;apellidos`), tabla de estados y reenvío |
| `api/invitacionesApi.js` | `listarInvitaciones`, `cargarInvitaciones`, `reenviarInvitacion` y `obtenerInvitacion` |
| `features/auth/RegistroPage.jsx` | Lee `?token=`, valida la invitación, precarga correo/nombres y envía `tokenInvitacion` al registrarse |

**Decisiones.**

- **CSV en el navegador:** el docente descarga una plantilla, el navegador valida las columnas y envía la lista al backend; el backend vuelve a validar cada fila antes de guardar.
- **Estados visibles:** `Invitado`, `Registrado` y `Vencida`; el reenvío se deshabilita si ya se registró.
- **Sin token no hay registro:** `/registro` sin una invitación válida muestra un aviso y no permite crear la cuenta.

**Pruebas.** `RegistroPage.test.jsx` cubre la validación de la invitación y el envío del token. La carga y el estado del listado quedan cubiertos por las pruebas del backend de invitaciones.

---

## Pendientes conocidos

- **Accesibilidad:** corregir los hallazgos del piloto (SCRUM-50); las pantallas actuales ya están medidas (sección 8).
- **Reportes del docente:** sigue en construcción (`/docente/reportes`).
- **Usabilidad:** el protocolo y la simulación interna están listos en el backend (`docs/pruebas/`), pero faltan usuarios reales y SUS (#143/#144).
