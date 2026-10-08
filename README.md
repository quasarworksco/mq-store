# MQ Store

Catálogo digital de MQ Store (The Florida Mall, Orlando), publicado en **https://mqstore.dgp-link.com** con GitHub Pages.

- `js/data.js` — categorías y productos (español / inglés). Aquí se cambian textos, fotos y videos.
- `img/productos/` — fotos de los productos.
- `js/config.js` — teléfono, WhatsApp, dirección y conexión con la base de datos del CRM.

No se muestran precios. Cada formulario (información, demostración, empleo y reseñas) se guarda en la colección `webLeads` de Firestore y el **CRM** lo convierte en prospecto, candidato o reseña por aprobar. Las reseñas aprobadas se leen de `reviews`.

Enlace de cada agente: `https://mqstore.dgp-link.com/?a=CODIGO` (el código aparece en el CRM → Panel admin → Conexiones → MQ Store).
