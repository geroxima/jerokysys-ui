# JerokySys UI

Interfaz web de JerokySys. Permite iniciar sesión y navegar por las secciones de
alumnos, responsables, profesores, facturas, campañas, asistencia y ajustes.

## Tecnologías

- Next.js 16 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Componentes de base-ui y shadcn

## Requisitos

- Node.js
- pnpm 11.27.0
- Una API de JerokySys en ejecución

## Instalación

1. Instala las dependencias:

   ```bash
   pnpm install
   ```

2. Copiá `.env.example` a `.env.local` y completá la URL de la API:

   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   # Opcional: URL que usa el login del lado del servidor.
   # API_BASE_URL=http://localhost:8080/api/v1
   ```

   Si no la definís, la aplicación usa `http://localhost:8080/api/v1`.
   Los datos fiscales del emisor (`NEXT_PUBLIC_ISSUER_*`) también van en
   `.env.local`. Los timbrados se cargan desde `GET /tax-stamps/valid`.

## Scripts

| Comando      | Acción                              |
| ------------ | ----------------------------------- |
| `pnpm dev`   | Inicia el servidor de desarrollo    |
| `pnpm build` | Genera la compilación de producción |
| `pnpm start` | Inicia la aplicación compilada      |
| `pnpm lint`  | Ejecuta ESLint                      |

Abre [http://localhost:3000](http://localhost:3000). La ruta `/` redirige a
`/login` o a `/dash` según el estado de la sesión.

## Autenticación

1. El formulario de `/login` llama a `POST /api/auth/login` (route handler de
   Next).
2. El handler envía las credenciales a `POST {API_BASE_URL}/login` y guarda el
   JWT en la cookie `jerokysys_token`, con `httpOnly`, `sameSite: lax` y
   `secure` en producción.
3. `proxy.ts` redirige a `/login` si la sesión no existe o si el JWT expiró.
4. Todas las llamadas de datos del navegador usan `lib/api-client.ts` con
   `credentials: "include"`. El gateway copia la cookie a
   `Authorization: Bearer` antes de validar el token.
5. `POST /api/auth/logout` borra la cookie y `GET /api/auth/session` devuelve
   usuario, rol y expiración (nunca el token).
6. Si el gateway responde `401`, `lib/api-client.ts` limpia la sesión y vuelve a
   `/login`.

En producción, si la UI y la API viven en subdominios distintos, definí
`AUTH_COOKIE_DOMAIN` (por ejemplo `.jerokysys.com`) para que la cookie se envíe
también al host de la API. Si ambas comparten origen mediante un reverse proxy,
no hace falta.

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
| `/invoices/[id]`         | Detalle de factura                     |
| `/invoices/[id]/edit`    | Edición de una factura pendiente       |
| `/guardians`             | Responsables                           |
| `/professors`            | Profesores                             |
| `/campaigns`             | Campañas                               |
| `/settings`              | Ajustes                                |

Salvo `/login`, `/academic` y las rutas de facturación, las páginas muestran un
texto de marcador de posición.

## Facturación

Las pantallas de `/invoices` consumen el microservicio de facturación a través de
`API_BASE_URL` y requieren un usuario con rol `ADMIN` o `SECRETARY`.

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
  (app)/          Secciones protegidas y diseño con barra lateral
  api/auth/       Route handlers de login, logout y sesión (cookie httpOnly)
  login/          Página de inicio de sesión
components/       Encabezado, barra lateral, formulario y componentes de UI
  invoices/       Componentes de facturación
lib/              Sesión, JWT, cliente de API, navegación y utilidades
  api-client.ts   Capa única de fetch del navegador (cookie + errores + 401)
  query/          Hooks de TanStack Query
  invoices/       Tipos, cliente y reglas de facturación
proxy.ts          Protección de rutas
```
