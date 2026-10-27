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

2. Crea el archivo `.env.local` con la URL de la API:

   ```bash
   API_BASE_URL=http://localhost:8080/api/v1
   ```

   Si no defines `API_BASE_URL`, la aplicación usa
   `http://localhost:8080/api/v1`.

## Scripts

| Comando      | Acción                              |
| ------------ | ----------------------------------- |
| `pnpm dev`   | Inicia el servidor de desarrollo    |
| `pnpm build` | Genera la compilación de producción |
| `pnpm start` | Inicia la aplicación compilada      |
| `pnpm lint`  | Ejecuta ESLint                      |

Abre [http://localhost:3000](http://localhost:3000). La ruta `/` redirige a
`/login` o a `/academic` según el estado de la sesión.

## Autenticación

1. El formulario de `/login` envía el usuario y la contraseña a
   `POST {API_BASE_URL}/login`.
2. La API responde con un JWT en texto plano.
3. La aplicación guarda el JWT en la cookie `jerokysys_token`, con las opciones
   `httpOnly`, `sameSite: lax` y `secure` en producción.
4. `proxy.ts` redirige a `/login` si la sesión no existe o si el JWT expiró.
5. El botón «Cerrar sesión» del encabezado borra la cookie y vuelve a `/login`.

Para las solicitudes autenticadas, `lib/api.ts` expone `authFetch`. Esta función
añade la cabecera `Authorization: Bearer <token>`.

## Rutas

| Ruta                   | Contenido        |
| ---------------------- | ---------------- |
| `/login`               | Inicio de sesión |
| `/academic`            | Inicio           |
| `/academic/attendance` | Asistencia       |
| `/invoices`            | Facturas         |
| `/students`            | Alumnos          |
| `/guardians`           | Responsables     |
| `/professors`          | Profesores       |
| `/campaigns`           | Campañas         |
| `/settings`            | Ajustes          |

Salvo `/login` y `/academic`, las páginas muestran un texto de marcador de
posición.

## Estructura

```text
app/
  (app)/          Secciones protegidas y diseño con barra lateral
  actions/        Acciones de servidor para iniciar y cerrar sesión
  login/          Página de inicio de sesión
components/       Encabezado, barra lateral, formulario y componentes de UI
lib/              Sesión, JWT, cliente de API, navegación y utilidades
proxy.ts          Protección de rutas
```
