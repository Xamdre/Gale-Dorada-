# Gale Dorada — conectar la base de datos

El repositorio ya incluye el frontend, el panel de administración y el esquema SQL. Para que la tienda guarde productos hace falta crear un **proyecto de base de datos** en Supabase. Iniciar sesión con GitHub o vincular el repositorio no crea por sí solo esa base de datos.

## 1. Crear el proyecto Supabase

1. Entra en https://supabase.com/dashboard.
2. Pulsa **New project**.
3. Elige una organización, escribe `gale-dorada` como nombre y selecciona el plan Free.
4. Crea una contraseña fuerte para la base de datos y guárdala en un gestor seguro. No la compartas en el chat.
5. Elige la región disponible más cercana a Colombia y crea el proyecto.
6. Espera a que el proyecto termine de aprovisionarse.

## 2. Crear tablas, permisos y almacenamiento

1. Abre **SQL Editor → New query**.
2. Abre el archivo `supabase/schema.sql` de este repositorio.
3. Copia todo su contenido, pégalo en SQL Editor y pulsa **Run**.
4. Comprueba que la consulta termine sin errores.

Esto crea perfiles, roles, categorías, productos, imágenes, pedidos, detalle de pedidos, reglas RLS y el bucket de imágenes. Los visitantes solo pueden consultar productos publicados; las escrituras requieren rol administrador.

## 3. Crear tu usuario administrador

1. En Supabase abre **Authentication → Users → Add user**.
2. Crea tu usuario con el correo y contraseña que usarás para entrar al panel.
3. Abre el usuario creado y copia su **User UID**.
4. En SQL Editor ejecuta esta consulta sustituyendo el texto por tu UID:

```sql
update public.profiles
set role = 'admin'
where id = 'PEGA-AQUI-EL-USER-UID';
```

No compartas la contraseña de Supabase ni la contraseña de tu usuario.

## 4. Conectar el proyecto al frontend

En Supabase abre **Project Settings → API** (o **Connect**, según la versión del panel) y copia:

- **Project URL**
- **Publishable key** (o la clave heredada `anon/public`)

En el proveedor donde despliegues la web, agrega estas variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICABLE
```

Para desarrollo local, copia `.env.example` como `.env.local` y completa esas dos variables. No subas `.env.local` a GitHub.

**Nunca** pongas una `service_role`, `sb_secret` o clave privada en una variable `NEXT_PUBLIC_*`, en el navegador o en GitHub. El frontend no necesita una clave secreta para gestionar productos: Supabase Auth y RLS aplican los permisos.

## 5. Entrar al panel

Cuando las variables estén configuradas y la web se haya desplegado de nuevo, abre:

`/admin/login`

Inicia sesión con el usuario administrador. Desde el panel podrás crear, editar, publicar, ocultar y eliminar productos, cambiar precios e inventario y subir fotografías.

## Estado de funciones

- Catálogo público conectado a productos publicados.
- Panel privado con acceso basado en el rol de `profiles`.
- Gestión de productos, precios, inventario, publicación e imágenes.
- Vista administrativa de pedidos preparada; el checkout y la pasarela de pago todavía no están habilitados.

La integración de pagos, cobros o datos comerciales debe configurarse después y con supervisión de un adulto responsable cuando corresponda. El plan gratuito es suficiente para pruebas iniciales, pero tiene límites de uso y no debe asumirse como capacidad ilimitada para una tienda en producción.
