# GALE DORADA

Tienda en línea construida con Next.js, TypeScript y Supabase.

## Configuración inicial

Sigue la guía completa en [supabase/SETUP.md](supabase/SETUP.md). En resumen:

1. Crea un proyecto de Supabase (iniciar sesión o vincular GitHub no crea automáticamente la base de datos).
2. Ejecuta el contenido de `supabase/schema.sql` en Supabase → SQL Editor.
3. Crea un usuario en Authentication → Users.
4. Asigna el rol administrador en SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where id = 'UUID_DEL_USUARIO';
   ```
5. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el hosting y vuelve a desplegar.

## Funciones implementadas

- Tienda pública con catálogo dinámico, búsqueda y carrito local.
- Panel privado en `/admin`, protegido con Supabase Auth y rol almacenado en `profiles`.
- Crear, editar, publicar, ocultar y eliminar productos.
- Precio en COP, categoría, existencias, fotografía y destacado.
- Almacenamiento de imágenes en Supabase Storage.
- Estructura de pedidos y vista administrativa preparada.

## Pendiente antes de vender

El carrito todavía no crea pedidos ni procesa pagos. Wompi, cálculo de envíos, notificaciones, dominio propio y otras integraciones comerciales deben configurarse y probarse antes de aceptar compras reales. Los pagos y la información comercial deben gestionarse con supervisión de un adulto responsable cuando corresponda.

Nunca publiques claves privadas, `service_role` o `sb_secret` en GitHub ni en variables `NEXT_PUBLIC_*`. La clave pública del proyecto se protege con las políticas RLS incluidas en el esquema.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```
