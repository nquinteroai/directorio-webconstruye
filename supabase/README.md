# Supabase — Guía de configuración paso a paso

Sigue estos pasos **en orden**. Tiempo estimado: 10 minutos.

## 1. Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) e inicia sesión (o crea una cuenta gratis).
2. Clic en **New project**.
3. Completa:
   - **Name**: `directorio-webconstruye`
   - **Database Password**: genera una contraseña fuerte y **guárdala** (no la vas a necesitar a diario, pero no se puede recuperar fácil).
   - **Region**: `South America (São Paulo)` — la más cercana a Colombia.
4. Clic en **Create new project** y espera ~2 minutos a que aprovisione.

## 2. Ejecutar el esquema (`schema.sql`)

1. En el menú lateral del proyecto, abre **SQL Editor**.
2. Clic en **New query**.
3. Abre el archivo [`supabase/schema.sql`](./schema.sql) de este repositorio, copia **todo** su contenido y pégalo en el editor.
4. Clic en **Run** (o `Ctrl+Enter`). Debe terminar con `Success. No rows returned`.

## 3. Cargar los datos iniciales (`seed.sql`)

1. En el SQL Editor, crea otra **New query**.
2. Copia **todo** el contenido de [`supabase/seed.sql`](./seed.sql) y pégalo.
3. Clic en **Run**.
4. Verifica que cargó, ejecutando esta consulta en una nueva query:

   ```sql
   select
     (select count(*) from public.zonas)      as zonas,      -- debe dar 2
     (select count(*) from public.categorias) as categorias, -- debe dar 25
     (select count(*) from public.negocios)   as negocios,   -- debe dar 10
     (select count(*) from public.resenas)    as resenas;    -- debe dar 15
   ```

## 4. Crear el usuario administrador

1. En el menú lateral, abre **Authentication → Users**.
2. Clic en **Add user → Create new user**.
3. Ingresa el **correo del administrador** de la agencia y una **contraseña fuerte**.
4. Marca **Auto Confirm User** y crea el usuario.
5. Regístralo como administrador: en el **SQL Editor**, ejecuta (reemplaza el correo):

   ```sql
   insert into public.admins (user_id, nota)
   select id, 'Administrador de la agencia'
   from auth.users
   where email = 'TU-CORREO@ejemplo.com';
   ```

6. Verifica: `select count(*) from public.admins;` debe dar `1`.

> **Cambiar la contraseña después**: Authentication → Users → clic en el
> usuario → **Reset password** (o desde el menú `⋮`). También puedes crear
> otro admin repitiendo este paso 4 con otro correo.

## 5. Bloquear el registro público (importante)

El panel `/admin` es solo para la agencia; nadie más debe poder crear cuentas:

1. Abre **Authentication → Sign In / Providers** (en algunos proyectos aparece
   como **Providers** o dentro de **Auth → Settings**).
2. En **Email**, desactiva **"Allow new users to sign up"**.
3. Verifica que **Anonymous sign-ins** esté desactivado (lo está por defecto).

## 6. Copiar las credenciales al proyecto

1. Abre **Project Settings → API Keys** (o **Settings → API**).
2. Copia estos 3 valores al archivo `.env.local` del proyecto (créalo copiando
   `.env.example`):

   | Valor en Supabase | Variable en `.env.local` |
   |---|---|
   | **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
   | **anon public** (o *Publishable key*) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **service_role** (o *Secret key*) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ La `service_role` / *Secret key* **nunca** va en el navegador ni en git.
> Solo vive en `.env.local` (local) y en las variables de entorno de Vercel.

## 7. Verificaciones finales

- **Storage**: en el menú **Storage** debe existir el bucket `negocios`
  (lo creó `schema.sql`). No hace falta crear nada manualmente.
- **Data API**: si al correr la app las consultas devuelven vacío o error 404,
  revisa **Settings → Data API** y confirma que el schema `public` está
  expuesto (es lo normal por defecto).

Listo. Con `.env.local` completo, la app se conecta automáticamente.
