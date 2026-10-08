# MQ Store

Catálogo digital de MQ Store (The Florida Mall, Orlando), publicado en **https://mqstore.dgp-link.com** con GitHub Pages.

- **Se administra desde el CRM** (menú *Tienda MQ Store*, solo administración): varias fotos por producto, video, textos en español e inglés, productos nuevos, ocultar / destacar / ordenar y datos de contacto. Todo se guarda en la colección `catalog` de Firestore.
- `js/data.js` — contenido base: categorías, productos y la sección "¿Qué necesitas?".
- `js/config.js` — valores por defecto de contacto y conexión con la base de datos del CRM.
- `img/` — logo (`logo.svg`, `logo-mark.svg`), íconos e imagen para compartir (`og.png`).

No se muestran precios. Cada formulario (información, demostración, empleo y reseñas) se guarda en la colección `webLeads` de Firestore y el **CRM** lo convierte en prospecto, candidato o reseña por aprobar. Las reseñas aprobadas se leen de `reviews`.

Enlace de cada agente: `https://mqstore.dgp-link.com/?a=CODIGO` (el código aparece en el CRM → Panel admin → Conexiones → MQ Store).
