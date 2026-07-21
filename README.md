# GameDay Live (Netlify + Neon)

Scoreboard público con panel de encargado y espacios publicitarios, corriendo sobre Netlify Functions + Neon (Postgres). Mismo patrón que usas en Casita.

## 1. Crear la base de datos en Neon

1. Crea un proyecto en [neon.tech](https://neon.tech) (o usa uno que ya tengas).
2. Abre el **SQL editor** de Neon y pega el contenido de `schema.sql` de este proyecto. Esto crea la tabla `games` y mete 3 juegos de ejemplo.
3. Copia la **connection string** con pooling (Dashboard → Connection Details → "Pooled connection").

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env`:
- `DATABASE_URL` — la connection string de Neon que copiaste.
- `ADMIN_PASSWORD` — la contraseña que le vas a dar a quien lleva el marcador.

## 3. Correr en local

```bash
npm install
npm run dev
```

Esto levanta `netlify dev`, que sirve `public/` y las funciones de `netlify/functions/` juntas en `http://localhost:8888`, simulando exactamente cómo corre en producción (incluye las redirecciones de `/api/*` del `netlify.toml`).

## 4. Deploy a Netlify

```bash
netlify deploy --prod
```

O conecta el repo desde el dashboard de Netlify (Sites → Add new site → Import an existing project). En cualquiera de los dos casos, agrega las mismas variables de entorno (`DATABASE_URL`, `ADMIN_PASSWORD`) en **Site settings → Environment variables** — el `.env` local no se sube ni se usa en producción.

## Cómo funciona

- **Buscar juegos**: lista de partidos con filtro por ciudad y buscador.
- **Marcador en vivo**: el scoreboard grande con 6 espacios de banner (superior, inferior, 2 laterales) listos para publicidad.
- **Panel del encargado**: pide la contraseña de `ADMIN_PASSWORD`. Actualiza marcador, reloj, periodo, estado y crea juegos nuevos.
- **Tiempo real por polling**: el navegador pregunta `/api/games` cada 4 segundos. No hay WebSocket porque las funciones de Netlify no mantienen conexiones abiertas — para un scoreboard esto es más que suficiente e igual de confiable, solo con un pequeño delay (máximo 4s) en vez de instantáneo.

### API

- `GET /api/games` — lista de juegos
- `GET /api/games/:id` — un juego
- `POST /api/games` — crear juego (header `x-admin-password`)
- `PUT /api/games/:id` — actualizar juego (header `x-admin-password`)
- `DELETE /api/games/:id` — borrar juego (header `x-admin-password`)

Cada una vive en `netlify/functions/` (`games.js` para la colección, `game.js` para un juego individual), y `netlify.toml` redirige `/api/games` y `/api/games/*` hacia ellas.

## Siguientes pasos

1. **Tiempo real instantáneo de verdad**: si el delay de 4s te molesta (por ejemplo, para el público dentro del estadio), la opción más simple sin salir del mundo serverless es **Pusher** o **Ably** (planes gratis dan de sobra para esto): la función `game.js` dispara un evento al guardar, y el cliente se suscribe en vez de hacer polling. Es un cambio contenido a esas dos piezas, no toca el resto.
2. **"Cerca de mí" con geolocalización real**: ya se guarda `lat`/`lng` por juego. Falta pedir `navigator.geolocation` en el navegador y ordenar por distancia en vez de solo filtrar por ciudad.
3. **Anuncios como datos**: una tabla `anuncios` (posición, imagen, link, vigencia) para rotar publicidad sin tocar código — los 6 espacios ya están listos en el HTML para recibir esa data.
4. **Autenticación por encargado**: ahora es una sola contraseña compartida. Si vas a tener varios encargados o varias ligas, conviene una tabla `usuarios_admin` con su propio login y permisos por partido.
