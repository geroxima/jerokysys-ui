# JerokySys UI

Interfaz web de JerokySys. Permite iniciar sesión y navegar por las secciones de
alumnos, responsables, profesores, facturas, campañas, asistencia y ajustes.

## Tecnologías

- Next.js 16 con App Router y export estático (SPA)
- React 19
- TypeScript
- Tailwind CSS 4
- Componentes de base-ui y shadcn

## Requisitos

- Node.js
- pnpm 11.27.0
- Una API de JerokySys en ejecución
- Un servidor de archivos estáticos (o Tomcat) para publicar `out/`

## Instalación

1. Instala las dependencias:

   ```bash
   pnpm install
   ```

2. Copiá `.env.example` a `.env.local` y completá la URL de la API:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   ```

   Si no la definís, la aplicación usa `http://localhost:8080/api/v1`.
   El origen de la UI debe estar permitido por CORS en el gateway; en
   `localhost:3000` ya lo está.
   Los datos fiscales del emisor (`NEXT_PUBLIC_ISSUER_*`) también van en
   `.env.local`. Los timbrados se cargan desde `GET /tax-stamps/valid`.

## Scripts

| Comando      | Acción                             |
| ------------ | ---------------------------------- |
| `pnpm dev`   | Inicia el servidor de desarrollo   |
| `pnpm build` | Genera el sitio estático en `out/` |
| `pnpm lint`  | Ejecuta ESLint                     |

`pnpm start` ya no aplica: la app se exporta como sitio estático.

Para probar el build:

```bash
pnpm build
python -m http.server 3000 --bind 0.0.0.0 --directory out
# o: npx serve out -l 3000
```

Abrí [http://localhost:3000](http://localhost:3000) (usá `localhost`, no
`127.0.0.1`, porque el gateway permite ese origen exacto). La ruta `/`
redirige a `/login/` o a `/dash/` según el token guardado en el navegador.

## Autenticación

1. El formulario de `/login/` llama directo a
   `POST {NEXT_PUBLIC_API_BASE_URL}/login`. El gateway devuelve el JWT como
   texto plano.
2. El navegador guarda el token en `sessionStorage` (`lib/client-token.ts`) y
   `AuthGuard` protege las rutas del grupo `(app)`.
3. `lib/api-client.ts` envía el token en `Authorization: Bearer` en cada
   llamada. No hay cookie de autenticación ni middleware de servidor.
4. Cerrar sesión borra el token y vuelve a `/login/`.
5. Si el gateway responde `401`, `lib/api-client.ts` limpia el token y redirige
   a `/login/`.

El gateway debe permitir CORS desde el origen de la UI. En `localhost:3000` ya
está configurado; si abrís la UI desde otra IP o dominio, agregá ese origen a
`app.cors.allowed-origins` del gateway o proxeá `/api/v1` por el servidor web.

El token queda en `sessionStorage` (no en una cookie `httpOnly`): es una
decisión del modo estático. La protección de rutas es del cliente, pero los
datos siguen protegidos por el gateway. Una pestaña nueva pide login de nuevo.

## Rutas

| Ruta                     | Contenido                              |
| ------------------------ | -------------------------------------- |
| `/login`                 | Inicio de sesión                       |
| `/dash`                  | Inicio                                 |
| `/attendance`            | Asistencia                             |
| `/classes`             | Clases           |
| `/disciplines`         | Disciplinas      |
| `/exams`               | Exámenes         |
| `/exam-results`        | Resultados       |
| `/enrollments`         | Inscripciones    |
| `/invoices`              | Listado y filtros de facturas          |
| `/invoices/new`          | Alta de factura                        |
| `/invoices/detail?id=…`  | Detalle de factura                     |
| `/invoices/edit?id=…`    | Edición de una factura pendiente       |
| `/exams/detail?id=…`     | Vista previa de un examen              |
| `/exams/edit?id=…`       | Edición de un examen y sus notas       |
| `/guardians`             | Responsables                           |
| `/professors`            | Profesores                             |
| `/campaigns`             | Campañas                               |
| `/settings`              | Ajustes                                |

Todas las rutas se prerenderizan en `out/`. Las del grupo `(app)` requieren un
token válido en `sessionStorage`; si falta o expiró, `AuthGuard` redirige a
`/login/`.

## Facturación

Las pantallas de `/invoices` consumen el microservicio de facturación a través de
`NEXT_PUBLIC_API_BASE_URL` y requieren un usuario con rol `ADMIN` o `SECRETARY`.

- Listado paginado con resumen por estado, búsqueda por razón social y filtros
  por número, timbrado, RUC, alumno, fecha, rango de fechas, rango de subtotal y
  condición de venta. El backend aplica un filtro a la vez.
- Alta y edición con una hoja de factura: encabezado del emisor, caja de
  comprobante, cliente, detalle editable y desglose de IVA (10 %, 5 % o exento).
  El servidor siempre recalcula los totales.
- El número de factura se genera automáticamente con el formato
  `timbrado-serie-correlativo` (`001-001-0000125`) a partir de las facturas del
  timbrado elegido. En edición, número y timbrado quedan bloqueados.
- Cambio de estado únicamente desde `PENDING` hacia `PAID` o `CANCELLED`, y
  eliminación lógica con confirmación.
- Los errores del backend se traducen a mensajes en español.

### Configuración del emisor

Copiá `.env.example` a `.env.local` y completá los datos fiscales:

| Variable            | Contenido                                             |
| ------------------- | ----------------------------------------------------- |
| `ISSUER_NAME`       | Nombre del emisor                                     |
| `ISSUER_RUC`        | RUC del emisor                                        |
| `ISSUER_ADDRESS`    | Dirección por defecto                                 |
| `ISSUER_PHONE`      | Teléfono                                              |
| `ISSUER_EMAIL`      | Correo de facturación                                 |
| `ISSUER_ACTIVITY`   | Actividad económica                                   |
| `INVOICE_TIMBRADOS` | JSON con `timbrado`, `serie`, `label` y `address`     |

Si `INVOICE_TIMBRADOS` falta, se usa el timbrado `001` con serie `001`. Los datos
del emisor que falten se muestran como “sin configurar”, sin romper la pantalla.

> El backend no expone un endpoint de correlativos: el siguiente número se
> calcula consultando las facturas del timbrado. Ante un conflicto (`409`), la
> acción regenera el número y reintenta una vez. Para concurrencia alta conviene
> una secuencia en el backend.

## Estructura

```text
app/
  (app)/            Secciones protegidas y diseño con barra lateral
  login/            Página de inicio de sesión
  page.tsx          Redirección cliente a /dash/ o /login/
components/         Encabezado, barra lateral, formulario y componentes de UI
  auth-guard.tsx    Guard de rutas basado en el token de sessionStorage
  invoices/         Componentes de facturación
lib/                Token, JWT, cliente de API, navegación y utilidades
  api-base.ts       URL base de la API (NEXT_PUBLIC_API_BASE_URL)
  api-client.ts     Capa única de fetch del navegador (Bearer + errores + 401)
  client-token.ts   Alta/baja del token en sessionStorage
  query/            Hooks de TanStack Query
  invoices/         Tipos, cliente y reglas de facturación
out/                Build estático (generado por pnpm build, ignorado por git)
```
