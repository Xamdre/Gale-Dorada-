# GALE DORADA

Tienda en línea construida con Next.js, TypeScript y Supabase.

## Activar catálogo y administración

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/202611240001_initial_store.sql` en el SQL Editor.
3. Invita tu usuario administrador en Supabase Authentication y asígnale en **App Metadata** el valor `{ "role": "admin" }`. No uses User Metadata para este permiso.
4. Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Render usando Project Settings → API.
5. Espera el despliegue automático. El catálogo público mostrará únicamente productos activos y el panel estará en `/admin`.

El panel permite crear, editar, publicar, destacar y eliminar productos, cargar imágenes y administrar estados de pedidos. Las políticas RLS restringen las operaciones privadas al usuario con rol admin.

## Seguridad y funciones aún pendientes

La creación de pedidos y la confirmación de pagos deben pasar por endpoints de servidor que verifiquen eventos de Wompi. No se habilitan escrituras públicas directas de pedidos. La integración de Wompi, sincronización de Google Calendar, cálculo real de envíos y dominio propio requieren credenciales/configuración del propietario antes de producción.

Consulta `.env.example` para las variables previstas. Nunca publiques claves privadas ni `SUPABASE_SERVICE_ROLE_KEY` en el navegador o en GitHub.

## Desarrollo

```bash
npm install
npm run dev
```
