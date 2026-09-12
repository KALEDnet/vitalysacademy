# Vitalis Academy — Panel interno

Guía paso a paso para dejar la aplicación funcionando. No necesitas saber
programar: son tres partes — Supabase (la base de datos), las dos
variables de conexión, y Netlify (donde se publica la página).

---

## PARTE 1 · Crear la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com), crea una cuenta si no
   tienes una, y crea un **proyecto nuevo**. Elige un nombre y una
   contraseña para la base de datos (guárdala, no la necesitarás en el
   día a día, pero es de tu proyecto).

2. Dentro del proyecto, ve al menú **SQL Editor** (ícono de una hoja con
   `>_`), crea una consulta nueva, abre el archivo `supabase/schema.sql`
   que viene en esta entrega, copia **todo** su contenido, pégalo ahí, y
   presiona **Run**. Esto crea todas las tablas, la seguridad y las
   reglas de la aplicación. Solo se hace una vez.

3. Crea el bucket (carpeta) donde se guardarán los PDF de certificados:
   ve a **Storage** → **New bucket** → escribe el nombre exacto
   `certificados` → déjalo marcado como **Private** (privado) → **Create
   bucket**.

4. Crea tu primer usuario, el administrador:
   ve a **Authentication** → **Users** → **Add user** → escribe tu
   correo y una contraseña → guarda. Ese será tu usuario para entrar a
   la aplicación.

5. Ese primer usuario se crea con permisos normales; para convertirlo en
   administrador, vuelve a **SQL Editor**, pega esta línea reemplazando
   el correo por el que usaste, y presiona **Run** (solo esta vez):

   ```sql
   update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'TU_CORREO_AQUI');
   ```

6. Por último, en **Authentication** → **Sign In / Providers** → **Email**,
   asegúrate de que la opción **"Confirm email"** esté **desactivada**.
   Así, cuando crees nuevos usuarios desde dentro del software (paso
   siguiente), podrán entrar de inmediato sin revisar su correo.

---

## PARTE 2 · Conectar la aplicación a tu proyecto

1. En Supabase, ve a **Settings** → **API**. Ahí verás dos datos:
   - **Project URL**
   - **Publishable / anon key**

2. Abre el archivo `.env.example` que viene en el proyecto, y guárdalo
   como `.env` (quitando el `.example`). Pega ahí tus dos datos, así:

   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-publica-aqui
   ```

Esto es todo lo que necesitas tocar del código.

---

## PARTE 3 · Publicar en Netlify

1. Sube la carpeta del proyecto a un repositorio de GitHub (o arrastra
   el proyecto directamente a Netlify, si prefieres no usar GitHub).

2. En [netlify.com](https://netlify.com), crea un sitio nuevo desde ese
   repositorio. Netlify detectará automáticamente el comando de
   construcción (`npm run build`) y la carpeta a publicar (`dist`),
   porque ya vienen configurados en el archivo `netlify.toml`.

3. Antes de que termine de publicarse, ve a **Site configuration** →
   **Environment variables**, y agrega las mismas dos variables del
   paso anterior:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Publica el sitio. Cuando termine, entra a la URL que te da Netlify.

5. Prueba la aplicación en esa URL (no hace falta instalar nada en tu
   computadora):
   - Entra con el correo y contraseña del administrador que creaste.
   - Entra a una ruta interna, por ejemplo `/ventas`, y refresca la
     página — debe seguir funcionando (esto confirma que el archivo
     `netlify.toml` está funcionando bien).
   - Ve a **Usuarios** y crea un asesor de ventas nuevo.
   - Cierra sesión, entra con ese asesor nuevo, y confirma que solo ve
     "Panel general" e "Inscripciones", sin acceso a Cursos, Reportes,
     Certificados ni Usuarios.

---

## Resumen rápido

**En Supabase:**
1. Crear proyecto.
2. Pegar `supabase/schema.sql` en el SQL Editor y ejecutar.
3. Crear el bucket `certificados` (privado).
4. Crear el usuario administrador en Authentication → Users.
5. Ejecutar la línea SQL que le da el rol `admin` a ese usuario.
6. Desactivar "Confirm email" en Authentication → Providers → Email.
7. Copiar el Project URL y la Publishable/anon key desde Settings → API.

**En el proyecto:**
8. Pegar esas dos claves en el archivo `.env`.

**En Netlify:**
9. Conectar el repositorio (o subir la carpeta).
10. Agregar las mismas dos variables de entorno en Netlify.
11. Publicar y probar en la URL pública: rutas internas, refrescar
    página, y el flujo de crear un usuario nuevo desde dentro del
    software.

No necesitas usar la CLI de Supabase, Edge Functions, ni el Table
Editor manualmente — todo lo demás ya está resuelto en el código.
