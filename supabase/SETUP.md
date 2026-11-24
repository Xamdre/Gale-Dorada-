# Gale Dorada — configuración de Supabase

## Qué incluye el esquema

El archivo `supabase/schema.sql` crea:

- Perfiles y roles (`customer` / `admin`).
- Categorías.
- Productos con precio en COP, SKU, inventario, estado y destacado.
- Varias imágenes por producto.
- Bucket `product-images` para las fotos.
- Políticas RLS: visitantes solo leen productos publicados; únicamente administradores autenticados pueden crear, editar o eliminar productos, categorías e imágenes.

## Configuración inicial

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**, pega el contenido de `supabase/schema.sql` y ejecútalo.
3. En **Authentication → Users**, crea tu usuario administrador.
4. Copia el UUID de ese usuario y ejecuta en SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = 'PEGA-AQUI-EL-UUID-DEL-USUARIO';
```

5. En la configuración de API del proyecto, guarda la Project URL y la clave publicable (anon/publishable) para conectarlas al frontend.

**Seguridad:** nunca pongas la clave `service_role` o una secret key en el navegador, en el repositorio ni en variables `NEXT_PUBLIC_*`. El acceso de escritura se controla con autenticación y RLS.

## Modelo de producto

Cada producto tiene nombre, slug, SKU opcional, descripción corta y larga, precio en pesos colombianos, precio anterior opcional, existencias, categoría, estado (`draft`, `published`, `archived`) y opción de destacado. Las imágenes se guardan en Storage y sus rutas en `product_images`.

## Próxima integración

El frontend debe conectar Supabase para:
- Mostrar en la tienda solo productos publicados.
- Incorporar inicio de sesión de administración.
- Crear, editar, publicar, archivar y eliminar productos.
- Subir y ordenar fotografías.
- Gestionar categorías e inventario.

La interfaz no debe permitir que un usuario visitante escriba directamente en las tablas. Las políticas RLS siguen siendo la barrera de seguridad, incluso si alguien intenta llamar la API por fuera de la página.
