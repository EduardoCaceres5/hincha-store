# 🚀 Guía de instalación y uso de la PWA de Hincha Store Admin

¡Tu aplicación web ahora es una Progressive Web App (PWA)! Esto significa que puedes instalarla en tu teléfono móvil y usarla como una app nativa.

## ✅ Lo que se ha configurado

- ✅ Plugin PWA instalado y configurado
- ✅ Service Worker registrado (funciona offline)
- ✅ Iconos PWA generados (192x192 y 512x512)
- ✅ Manifest configurado con ruta inicial `/admin`
- ✅ Caché de API configurado
- ✅ Auto-actualización habilitada

## 📱 Cómo instalar la PWA en tu teléfono

### Desde Android (Chrome/Edge):

1. **Accede a tu sitio web** desplegado (ej: https://hincha-store.com)
2. Navega a la sección `/admin` e inicia sesión como admin
3. **Toca el menú de tres puntos** (⋮) en el navegador
4. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar aplicación"**
5. Confirma la instalación
6. **¡Listo!** Ahora verás el icono de "HS Admin" en tu pantalla de inicio

### Desde iPhone/iPad (Safari):

1. **Accede a tu sitio web** desplegado
2. Navega a `/admin` e inicia sesión
3. **Toca el botón de compartir** (📤) en la parte inferior
4. Desplázate y selecciona **"Agregar a pantalla de inicio"**
5. Edita el nombre si quieres (ej: "HS Admin")
6. Toca **"Agregar"**
7. **¡Listo!** Verás el icono en tu pantalla de inicio

## 🧪 Probar localmente

### En desarrollo:
```bash
pnpm run dev
```
Visita: http://localhost:5173

La PWA está habilitada en desarrollo, pero para la mejor experiencia de prueba:

### En preview (simula producción):
```bash
pnpm run build
pnpm run preview
```
Visita: http://localhost:4173

### Desde tu teléfono en la misma red WiFi:

1. Obtén tu IP local:
   ```bash
   # En Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # O más simple
   ipconfig getifaddr en0
   ```

2. Inicia el servidor con --host:
   ```bash
   pnpm run preview -- --host
   ```

3. **En tu teléfono**, abre el navegador y ve a:
   ```
   http://TU_IP:4173
   ```
   Por ejemplo: `http://192.168.1.100:4173`

4. Sigue los pasos de instalación mencionados arriba

## 🎨 Personalizar la PWA

### Cambiar colores del tema:
Edita `vite.config.ts`:
```typescript
manifest: {
  theme_color: '#319795',        // Color de la barra de estado
  background_color: '#ffffff',   // Color de fondo al abrir
}
```

### Cambiar nombre de la app:
```typescript
manifest: {
  name: 'Tu Nombre Personalizado',
  short_name: 'Nombre Corto',
}
```

### Cambiar página de inicio:
```typescript
manifest: {
  start_url: '/admin',  // Cambia a la ruta que prefieras
}
```

## 🔄 Actualizaciones

La PWA se actualiza automáticamente cuando detecta una nueva versión. Los usuarios verán un mensaje:
> "Nueva versión disponible. ¿Recargar?"

Para forzar una actualización inmediata, el usuario solo necesita:
1. Cerrar completamente la app
2. Volver a abrirla

## 🌐 Modo Offline

La PWA cachea automáticamente:
- Todos los archivos estáticos (JS, CSS, imágenes)
- Llamadas a la API (durante 24 horas)
- Las páginas visitadas

Esto significa que la app funcionará incluso sin conexión a Internet (con datos cacheados).

## 🚀 Desplegar en producción

### Opción 1: Netlify / Vercel
```bash
pnpm run build
# Sube la carpeta dist/
```

### Opción 2: Tu propio servidor
```bash
pnpm run build

# Copia los archivos de dist/ a tu servidor
scp -r dist/* usuario@tuservidor.com:/ruta/web/
```

### Importante para HTTPS:
⚠️ **Las PWA requieren HTTPS** (excepto en localhost). Asegúrate de que tu sitio tenga un certificado SSL instalado.

## 📊 Verificar que la PWA funciona

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **"Application"**
3. En el menú lateral, busca:
   - **"Manifest"**: Verifica que aparezca correctamente
   - **"Service Workers"**: Debe mostrar el SW activo
   - **"Cache Storage"**: Verifica que los archivos estén cacheados

## 🐛 Solución de problemas

### La PWA no se instala:
- ✅ Verifica que estás usando HTTPS (o localhost)
- ✅ Asegúrate de que el manifest esté cargando: `/manifest.webmanifest`
- ✅ Verifica que los iconos existan: `/pwa-192x192.png` y `/pwa-512x512.png`

### No funciona offline:
- ✅ Verifica que el Service Worker esté registrado en DevTools
- ✅ Limpia la caché y recarga la página
- ✅ Asegúrate de haber visitado las páginas mientras tenías conexión

### El logo no aparece bien:
- Puedes regenerar los iconos ejecutando:
  ```bash
  node scripts/generate-pwa-icons.js
  ```

## 🎯 Próximos pasos sugeridos

1. **Subir a producción**: Despliega tu app en un servidor con HTTPS
2. **Probar en dispositivos reales**: Instala en varios teléfonos
3. **Agregar notificaciones push** (opcional): Requiere configuración adicional
4. **Mejorar el caché**: Ajusta las estrategias según tus necesidades

## 📚 Recursos adicionales

- [PWA Builder](https://www.pwabuilder.com/): Herramientas útiles para PWA
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/): Documentación oficial
- [Web.dev PWA](https://web.dev/progressive-web-apps/): Guías de Google

---

¿Necesitas ayuda? Consulta la documentación o contacta al equipo de desarrollo.
