/* =========================================================
   MQ Store — catálogo conectado al CRM
   ---------------------------------------------------------
   - Contenido base en js/data.js. Desde el CRM (Catálogo MQ Store)
     se suben fotos, videos y textos, se crean productos nuevos, se
     ocultan o destacan, y se cambian los datos de contacto: todo se
     guarda en Firestore (colección catalog) y la tienda lo aplica.
   - Navegación: #/  ·  #/c/categoria  ·  #/p/producto
   - Español / inglés. "Mi lista" para pedir varios productos juntos.
   - Cada formulario crea un documento en webLeads; el CRM lo convierte
     en prospecto, candidato o reseña por aprobar. Nunca hay precios.
   ========================================================= */
(() => {
  const CFG = window.MQ_CONFIG;
  const BASE = window.MQ_DATA;
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  // Fotos de Cloudinary optimizadas al tamaño que se muestran
  const img = (url, w) => { const m = String(url || '').match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/); return m ? `${m[1]}c_limit,w_${w},q_auto,f_auto/${m[2]}` : url; };

  const ICONS = {
    drop: '<path d="M12 2.7s-6 6.4-6 11.3a6 6 0 0 0 12 0C18 9.1 12 2.7 12 2.7z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    glass: '<path d="M6 3h12l-1.5 17a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1z"/><path d="M6.5 9c2-1 3.5 1 5.5 0s3.5-1 5.5 0"/>',
    well: '<path d="M4 10h16M6 10v10h12V10M3 10l9-6 9 6"/><path d="M12 13v4"/>',
    sparkle: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h20M9 6c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v4H9z"/>',
    chair: '<path d="M7 3h6a4 4 0 0 1 4 4v6H9a2 2 0 0 1-2-2z"/><path d="M5 13h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM7 18l-1 3M17 18l1 3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-10 16z"/><path d="M4 21c4-6 8-9 13-12"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    home: '<path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    bookmark: '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    ig: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    wa: '<path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.2-1.8-1-1 .8a4 4 0 0 1-2.5-2.5l.8-1-1-1.8z"/>'
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ICONS.grid}</svg>`;

  /* ---------- Idioma ---------- */
  const T = {
    es: {
      nav_products: 'Productos', nav_reviews: 'Testimonios', nav_jobs: 'Trabaja con nosotros', nav_contact: 'Contacto',
      all: 'Todo', search_short: 'Buscar productos', search_ph: 'Buscar: agua, masaje, limpieza, energía…', search_btn: 'Buscar', search_none: 'No encontramos productos con esa búsqueda.', search_try: 'Prueba con',
      cta: 'Solicitar información', cta_full: 'Solicitar información o demostración', demo: 'Solicitar una demostración',
      hero_kicker: 'The Florida Mall · Orlando',
      hero_title: 'Agua pura, bienestar y <em>tecnología</em> para tu hogar',
      hero_lead: 'Soluciones para el agua, la limpieza, el descanso, el exterior y la energía de tu hogar. Te asesoramos y te mostramos cómo funcionan, sin compromiso.',
      see_catalog: 'Ver catálogo', hero_m1: 'Demostración sin costo', hero_m2: 'Asesoría personalizada', hero_m3: 'Español e inglés',
      finder_t: '¿Qué estás buscando?', finder_p: 'Elige una categoría y descubre sus productos.',
      t1: 'Demostración sin costo', t1s: 'Te mostramos cómo funciona', t2: 'Asesoría personalizada', t2s: 'Según las necesidades de tu hogar',
      t3: 'The Florida Mall', t3s: 'Orlando, Florida', t4: 'Atención bilingüe', t4s: 'Español e inglés',
      needs_k: 'Te orientamos', needs_t: '¿Qué necesitas para tu hogar?', needs_p: 'Cuéntanos qué buscas y te llevamos a la solución indicada.',
      products_n: (n) => `${n} ${n === 1 ? 'producto' : 'productos'}`, see_all: 'Ver todos', photos: (n) => `${n} fotos`,
      prod_k: 'Catálogo', prod_t: 'Nuestros productos', prod_p: 'Sin precios publicados: cada solución se adapta a tu hogar. Solicita información y un asesor te contacta.',
      how_k: 'Así de fácil', how_t: '¿Cómo funciona?',
      s1: 'Elige lo que te interesa', s1p: 'Explora el catálogo y guarda en tu lista los productos que quieras conocer.',
      s2: 'Solicita información', s2p: 'Déjanos tus datos y un asesor te contacta para resolver tus dudas.',
      s3: 'Vive la demostración', s3p: 'Agenda una demostración y comprueba cómo funciona antes de decidir.',
      rev_k: 'Testimonios', rev_t: 'Lo que dicen nuestros clientes', rev_p: 'Experiencias reales de familias que ya disfrutan nuestros productos.',
      rev_empty_t: 'Muy pronto compartiremos las experiencias de nuestros clientes', rev_empty_p: '¿Ya tienes alguno de nuestros productos? Cuéntanos cómo te ha ido.',
      rev_add: 'Dejar mi reseña',
      job_k: 'Oportunidades', job_t: 'Crece con nosotros en ventas',
      job_p: '¿Te apasionan las ventas y el servicio al cliente? Buscamos personas con ganas de crecer para unirse a nuestro equipo.',
      job_b1: 'Capacitación en nuestros productos', job_b2: 'Trabajo en equipo', job_b3: 'Oportunidades de crecimiento', job_b4: 'Español e inglés',
      job_place: 'Estamos en The Florida Mall, Orlando', job_form_t: 'Me interesa trabajar con ustedes', job_form_p: 'Déjanos tus datos y te contactamos.', job_send: 'Enviar mis datos',
      contact_k: 'Contacto', contact_t: 'Visítanos o escríbenos', call: 'Llámanos', visit: 'Visítanos', write: 'Escríbenos',
      band_t: '¿Quieres conocer un producto en persona?', band_p: 'Agenda una demostración sin costo y resuelve todas tus dudas.',
      benefits: 'Beneficios principales', video: 'Míralo en acción', related: 'También te puede interesar',
      no_price: 'El precio depende de tu hogar y del sistema que elijas. Solicita información y te asesoramos sin compromiso.',
      why1: 'Demostración sin costo', why2: 'Asesoría personalizada', why3: 'The Florida Mall, Orlando',
      add_list: 'Guardar en mi lista', added: 'Guardado en tu lista', removed: 'Quitado de tu lista',
      list_t: 'Mi lista', list_empty: 'Aún no has guardado productos. Usa el botón de guardar en cada producto.', list_send: 'Solicitar información de mi lista', list_keep: 'Seguir viendo',
      f_title_info: 'Solicitar información o demostración', f_sub: 'Te contactamos pronto. Tus datos solo se usan para atender tu solicitud.',
      f_name: 'Nombre completo', f_phone: 'Teléfono', f_email: 'Correo electrónico', f_city: 'Ciudad o código postal', f_opt: '(opcional)',
      f_want: '¿Qué te gustaría?', f_info: 'Recibir información', f_demo: 'Una demostración', f_time: 'Mejor horario para llamarte',
      times: ['Cualquier horario', 'Mañana (9 a. m. – 12 p. m.)', 'Tarde (12 – 5 p. m.)', 'Noche (5 – 8 p. m.)'],
      f_msg: 'Mensaje', f_msg_ph: 'Cuéntanos qué necesitas o tus preguntas', f_products: 'Productos de interés',
      f_consent: 'Acepto que MQ Store me contacte por teléfono, mensaje de texto o correo para atender mi solicitud.',
      f_send: 'Enviar solicitud', f_sending: 'Enviando…',
      f_ok_t: '¡Solicitud enviada!', f_ok_p: 'Gracias. Un asesor de MQ Store te contactará muy pronto.', f_close: 'Listo',
      f_err: 'No se pudo enviar. Revisa tu conexión e intenta de nuevo.', f_req: 'Completa tu nombre y un teléfono válido.', f_req_c: 'Marca la casilla para que podamos contactarte.',
      r_title: 'Comparte tu experiencia', r_sub: 'Tu reseña se publica después de revisarla.', r_rating: 'Calificación', r_product: 'Producto', r_text: 'Tu reseña', r_send: 'Enviar reseña',
      r_ok_t: '¡Gracias por tu reseña!', r_ok_p: 'La revisaremos y la publicaremos muy pronto.', r_req: 'Escribe tu nombre, tu reseña y la calificación.',
      j_exp: 'Experiencia en ventas o atención al cliente', j_lang: 'Idiomas', j_ok_t: '¡Recibimos tus datos!', j_ok_p: 'Nuestro equipo te contactará para contarte más.',
      footer_p: 'Soluciones para el agua, la limpieza, el descanso, el exterior y la energía de tu hogar.',
      f_cats: 'Categorías', f_company: 'MQ Store', rights: 'Todos los derechos reservados.'
    },
    en: {
      nav_products: 'Products', nav_reviews: 'Reviews', nav_jobs: 'Careers', nav_contact: 'Contact',
      all: 'All', search_short: 'Search products', search_ph: 'Search: water, massage, cleaning, power…', search_btn: 'Search', search_none: 'No products match your search.', search_try: 'Try',
      cta: 'Request information', cta_full: 'Request information or a demo', demo: 'Request a demonstration',
      hero_kicker: 'The Florida Mall · Orlando',
      hero_title: 'Pure water, wellness and <em>technology</em> for your home',
      hero_lead: 'Solutions for your home’s water, cleaning, relaxation, outdoors and energy. We advise you and show you how they work, with no obligation.',
      see_catalog: 'Browse catalog', hero_m1: 'Free demonstration', hero_m2: 'Personalized advice', hero_m3: 'Spanish & English',
      finder_t: 'What are you looking for?', finder_p: 'Pick a category and discover its products.',
      t1: 'Free demonstration', t1s: 'We show you how it works', t2: 'Personalized advice', t2s: 'Based on your home’s needs',
      t3: 'The Florida Mall', t3s: 'Orlando, Florida', t4: 'Bilingual service', t4s: 'Spanish & English',
      needs_k: 'We guide you', needs_t: 'What does your home need?', needs_p: 'Tell us what you’re looking for and we’ll take you to the right solution.',
      products_n: (n) => `${n} ${n === 1 ? 'product' : 'products'}`, see_all: 'See all', photos: (n) => `${n} photos`,
      prod_k: 'Catalog', prod_t: 'Our products', prod_p: 'No published prices: every solution is tailored to your home. Request information and an advisor will reach out.',
      how_k: 'It’s that easy', how_t: 'How it works',
      s1: 'Choose what you like', s1p: 'Browse the catalog and save the products you want to learn about.',
      s2: 'Request information', s2p: 'Leave your details and an advisor will contact you to answer your questions.',
      s3: 'See it in action', s3p: 'Book a demonstration and see how it works before you decide.',
      rev_k: 'Reviews', rev_t: 'What our customers say', rev_p: 'Real experiences from families who already enjoy our products.',
      rev_empty_t: 'Customer stories coming soon', rev_empty_p: 'Already own one of our products? Tell us how it’s going.',
      rev_add: 'Write a review',
      job_k: 'Opportunities', job_t: 'Grow with us in sales',
      job_p: 'Passionate about sales and customer service? We’re looking for motivated people to join our team.',
      job_b1: 'Product training', job_b2: 'Teamwork', job_b3: 'Growth opportunities', job_b4: 'Spanish & English',
      job_place: 'We’re at The Florida Mall, Orlando', job_form_t: 'I’m interested in working with you', job_form_p: 'Leave your details and we’ll contact you.', job_send: 'Send my details',
      contact_k: 'Contact', contact_t: 'Visit or contact us', call: 'Call us', visit: 'Visit us', write: 'Email us',
      band_t: 'Want to see a product in person?', band_p: 'Book a free demonstration and get all your questions answered.',
      benefits: 'Key benefits', video: 'See it in action', related: 'You may also like',
      no_price: 'Pricing depends on your home and the system you choose. Request information and we’ll advise you with no obligation.',
      why1: 'Free demonstration', why2: 'Personalized advice', why3: 'The Florida Mall, Orlando',
      add_list: 'Save to my list', added: 'Saved to your list', removed: 'Removed from your list',
      list_t: 'My list', list_empty: 'You haven’t saved any products yet. Use the save button on each product.', list_send: 'Request info for my list', list_keep: 'Keep browsing',
      f_title_info: 'Request information or a demo', f_sub: 'We’ll contact you soon. Your details are only used to handle your request.',
      f_name: 'Full name', f_phone: 'Phone', f_email: 'Email', f_city: 'City or ZIP code', f_opt: '(optional)',
      f_want: 'What would you like?', f_info: 'Get information', f_demo: 'A demonstration', f_time: 'Best time to call you',
      times: ['Any time', 'Morning (9 am – 12 pm)', 'Afternoon (12 – 5 pm)', 'Evening (5 – 8 pm)'],
      f_msg: 'Message', f_msg_ph: 'Tell us what you need or your questions', f_products: 'Products of interest',
      f_consent: 'I agree that MQ Store may contact me by phone, text message or email about my request.',
      f_send: 'Send request', f_sending: 'Sending…',
      f_ok_t: 'Request sent!', f_ok_p: 'Thank you. An MQ Store advisor will contact you very soon.', f_close: 'Done',
      f_err: 'Couldn’t send. Check your connection and try again.', f_req: 'Enter your name and a valid phone number.', f_req_c: 'Check the box so we can contact you.',
      r_title: 'Share your experience', r_sub: 'Your review is published after we check it.', r_rating: 'Rating', r_product: 'Product', r_text: 'Your review', r_send: 'Send review',
      r_ok_t: 'Thanks for your review!', r_ok_p: 'We’ll check it and publish it very soon.', r_req: 'Enter your name, your review and a rating.',
      j_exp: 'Sales or customer service experience', j_lang: 'Languages', j_ok_t: 'We got your details!', j_ok_p: 'Our team will contact you to tell you more.',
      footer_p: 'Solutions for your home’s water, cleaning, relaxation, outdoors and energy.',
      f_cats: 'Categories', f_company: 'MQ Store', rights: 'All rights reserved.'
    }
  };
  let lang = store.get('mq_lang', 'es') === 'en' ? 'en' : 'es';
  const t = (k, ...a) => { const v = T[lang][k]; return typeof v === 'function' ? v(...a) : v; };
  const L = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? (o[lang] && (!Array.isArray(o[lang]) || o[lang].length) ? o[lang] : o.es) : o || '');

  /* ---------- Catálogo: base + lo que se edita en el CRM ---------- */
  const cats = BASE.categories;
  let products = [];
  let contact = Object.assign({}, CFG.contact);
  const has = (v) => v != null && v !== '' && !(Array.isArray(v) && !v.length);
  const hasL = (o) => o && (has(o.es) || has(o.en));
  function build(over) {
    over = over || {};
    const cfg = over._config || {};
    contact = Object.assign({}, CFG.contact, ...Object.entries(cfg).filter(([k, v]) => k in CFG.contact && has(v)).map(([k, v]) => ({ [k]: v })));
    const list = BASE.products.map((p, i) => {
      const o = over[p.slug] || {};
      const q = Object.assign({}, p, { order: i, images: [p.image, ...(p.gallery || [])].filter(Boolean) });
      ['name', 'nameEn', 'brand', 'video', 'cta', 'cat'].forEach((k) => { if (has(o[k])) q[k] = o[k]; });
      ['subtitle', 'desc', 'benefits'].forEach((k) => { if (hasL(o[k])) q[k] = { es: has(o[k].es) ? o[k].es : p[k].es, en: has(o[k].en) ? o[k].en : p[k].en }; });
      if (has(o.images)) q.images = o.images;
      if (typeof o.featured === 'boolean') q.featured = o.featured;
      if (typeof o.order === 'number') q.order = o.order;
      q.hidden = !!o.hidden;
      return q;
    });
    // Productos nuevos creados desde el CRM
    Object.entries(over).forEach(([slug, o]) => {
      if (slug === '_config' || !o || !o.custom || !o.name || !cats.some((c) => c.id === o.cat) || list.some((p) => p.slug === slug)) return;
      list.push({ slug, cat: o.cat, brand: o.brand || '', name: o.name, nameEn: o.nameEn || '', subtitle: o.subtitle || {}, desc: o.desc || {}, benefits: o.benefits || { es: [], en: [] },
        images: o.images || [], video: o.video || '', cta: o.cta || '', featured: !!o.featured, hidden: !!o.hidden, order: typeof o.order === 'number' ? o.order : 1000 });
    });
    products = list.filter((p) => !p.hidden).sort((a, b) => a.order - b.order);
  }
  build(store.get('mq_catalog_cache', null));

  const catById = (id) => cats.find((c) => c.id === id);
  const prodBySlug = (s) => products.find((p) => p.slug === s);
  const pName = (p) => (lang === 'en' && p.nameEn) || p.name;
  const inCat = (id) => products.filter((p) => p.cat === id);
  const benefitsOf = (p) => L(p.benefits) || [];

  // Foto del producto o imagen provisional con los colores de su categoría
  function media(p, w = 640, alt) {
    const u = p.images && p.images[0];
    if (u) return `<img src="${esc(img(u, w))}" alt="${esc(pName(p))}" loading="lazy">${alt && p.images[1] ? `<img class="alt" src="${esc(img(p.images[1], w))}" alt="" loading="lazy">` : ''}`;
    const c = catById(p.cat) || cats[0];
    return `<div class="ph" role="img" aria-label="${esc(pName(p))}"><div class="ph-in"><div class="ph-ico">${icon(c.icon)}</div><div class="ph-name">${esc(p.brand || pName(p))}</div></div></div>`;
  }

  /* ---------- Enlace de cada agente (?a=codigo) ---------- */
  (function captureRef() {
    const q = new URLSearchParams(location.search);
    const r = (q.get('a') || q.get('ref') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    if (r) store.set('mq_ref', { r, at: Date.now() });
  })();
  const ref = () => { const v = store.get('mq_ref', null); return v && Date.now() - v.at < 30 * 864e5 ? v.r : ''; };

  /* ---------- Mi lista ---------- */
  let list = store.get('mq_list', []);
  const inList = (s) => list.includes(s);
  function toggleList(s) {
    if (inList(s)) { list = list.filter((x) => x !== s); toast(t('removed')); } else { list.push(s); toast(t('added')); }
    store.set('mq_list', list);
    paintList();
    $$(`[data-save="${s}"]`).forEach((b) => { b.classList.toggle('on', inList(s)); b.setAttribute('aria-pressed', inList(s)); });
  }
  function paintList() { list = list.filter((s) => prodBySlug(s)); const c = $('#listCount'); c.textContent = list.length; c.hidden = !list.length; }

  /* ---------- Componentes ---------- */
  const card = (p) => {
    const c = catById(p.cat);
    const n = (p.images || []).length;
    return `<article class="card-p reveal" style="--c:${c.color}">
      <a class="media" href="#/p/${p.slug}" aria-label="${esc(pName(p))}">
        ${media(p, 640, true)}
        <span class="tag"><span class="d"></span>${esc(p.brand || L(c.name))}</span>
        <span class="pills">${p.video ? `<span class="pill">${icon('play')}Video</span>` : ''}${n > 1 ? `<span class="pill">${icon('camera')}${n}</span>` : ''}</span>
      </a>
      <div class="body">
        <h4><a href="#/p/${p.slug}">${esc(pName(p))}</a></h4>
        <div class="sub">${esc(L(p.subtitle))}</div>
        <ul>${benefitsOf(p).slice(0, 3).map((b) => `<li>${icon('check', 'sm')}<span>${esc(b)}</span></li>`).join('')}</ul>
        <div class="actions">
          <button class="btn primary sm" data-lead="${p.slug}">${t('cta')}</button>
          <button class="icon-btn ${inList(p.slug) ? 'on' : ''}" data-save="${p.slug}" aria-pressed="${inList(p.slug)}" title="${t('add_list')}" aria-label="${t('add_list')}">${icon('bookmark', 'sm')}</button>
        </div>
      </div>
    </article>`;
  };

  function header() {
    $('#nav').innerHTML = `
      <a href="#/" data-go="productos">${t('nav_products')}</a>
      <a href="#/" data-go="testimonios">${t('nav_reviews')}</a>
      <a href="#/" data-go="oportunidades">${t('nav_jobs')}</a>
      <a href="#/" data-go="contacto">${t('nav_contact')}</a>`;
    $('#searchPill').innerHTML = `${icon('search', 'sm')}<span>${t('search_short')}</span><kbd>/</kbd>`;
    $('#ctaTop').textContent = t('cta');
    $('#langBtn').textContent = lang === 'es' ? 'EN' : 'ES';
    document.documentElement.lang = lang;
  }
  function catbar(active) {
    $('#catbarIn').innerHTML = `<a class="cb ${!active ? 'on' : ''}" href="#/" data-go="productos" style="--c:#1d5bd8"><span class="dot">${icon('grid')}</span>${t('all')}</a>` +
      cats.map((c) => `<a class="cb ${active === c.id ? 'on' : ''}" href="#/c/${c.id}" style="--c:${c.color}"><span class="dot">${icon(c.icon)}</span>${esc(L(c.name))}</a>`).join('');
    const bar = $('#catbarIn'), on = $('#catbarIn .cb.on');
    if (!active) bar.scrollLeft = 0;
    else if (on) bar.scrollLeft = on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2;
  }

  function footer() {
    const ct = contact;
    $('#foot').innerHTML = `<div class="wrap">
      <div class="foot-in">
        <div><a class="logo" href="#/"><img src="img/logo-mark.svg" alt="" width="40" height="40"><span class="logo-text"><b>MQ</b> <span>Store</span></span></a><p>${t('footer_p')}</p>
          <div style="display:flex;gap:10px;margin-top:16px">${ct.instagram ? `<a class="sq" style="background:transparent;border-color:rgba(255,255,255,.2);color:#fff" href="${esc(ct.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${icon('ig')}</a>` : ''}${ct.facebook ? `<a class="sq" style="background:transparent;border-color:rgba(255,255,255,.2);color:#fff" href="${esc(ct.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${icon('fb')}</a>` : ''}</div></div>
        <div><h4>${t('f_cats')}</h4><ul>${cats.map((c) => `<li><a href="#/c/${c.id}">${esc(L(c.name))}</a></li>`).join('')}</ul></div>
        <div><h4>${t('f_company')}</h4><ul>
          <li><a href="#/" data-go="testimonios">${t('nav_reviews')}</a></li>
          <li><a href="#/" data-go="oportunidades">${t('nav_jobs')}</a></li>
          <li><a href="#/" data-go="contacto">${t('nav_contact')}</a></li>
        </ul></div>
        <div><h4>${t('nav_contact')}</h4><ul>
          ${ct.phone ? `<li><a href="tel:${esc(ct.phone)}">${esc(prettyPhone(ct.phone))}</a></li>` : ''}
          ${ct.email ? `<li><a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></li>` : ''}
          <li><a href="${esc(ct.mapsUrl)}" target="_blank" rel="noopener">${esc(ct.location)}<br>${esc(ct.address)}</a></li>
        </ul></div>
      </div>
      <div class="foot-bottom"><span>© ${new Date().getFullYear()} MQ Store. ${t('rights')}</span><span>Orlando, Florida</span></div>
    </div>`;
  }
  const prettyPhone = (p) => { const d = String(p).replace(/\D/g, '').slice(-10); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p; };

  /* ---------- Portada ---------- */
  function home() {
    const ct = contact;
    return `
      <section class="hero">
        <div class="wrap hero-in">
          <div>
            <span class="eyebrow"><span class="dot"></span>${t('hero_kicker')}</span>
            <h1>${t('hero_title')}</h1>
            <p class="lead">${t('hero_lead')}</p>
            <button class="hero-search" data-search type="button">${icon('search')}<span>${t('search_ph')}</span><b>${t('search_btn')}</b></button>
            <div class="hero-ctas">
              <a class="btn white" href="#/" data-go="productos">${t('see_catalog')} ${icon('arrow', 'sm')}</a>
              <button class="btn outline-w" data-lead="">${t('demo')}</button>
            </div>
            <div class="hero-meta"><span>${icon('check', 'sm')}${t('hero_m1')}</span><span>${icon('check', 'sm')}${t('hero_m2')}</span><span>${icon('check', 'sm')}${t('hero_m3')}</span></div>
          </div>
          <div class="finder">
            <h2>${t('finder_t')}</h2><p>${t('finder_p')}</p>
            <div class="finder-grid">${cats.map((c) => `<a class="ft" href="#/c/${c.id}" style="--c:${c.color}"><span class="ico">${icon(c.icon)}</span><strong>${esc(L(c.name))}</strong><small>${t('products_n', inCat(c.id).length)} →</small></a>`).join('')}</div>
          </div>
        </div>
      </section>

      <section class="trust"><div class="wrap trust-in">
        ${[['calendar', 't1', 't1s'], ['users', 't2', 't2s'], ['pin', 't3', 't3s'], ['globe', 't4', 't4s']].map(([i, a, b]) => `<div class="trust-item"><span class="ico">${icon(i)}</span><span>${t(a)}<small>${t(b)}</small></span></div>`).join('')}
      </div></section>

      <section class="sec"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('needs_k')}</div><h2>${t('needs_t')}</h2><p>${t('needs_p')}</p></div></div>
        <div class="needs">${(BASE.needs || []).filter((n) => n.to.startsWith('c/') ? catById(n.to.slice(2)) : prodBySlug(n.to.slice(2))).map((n) => `
          <a class="need reveal" href="#/${n.to}" style="--c:${n.color}"><span class="ico">${icon(n.icon)}</span><span><strong>${esc(L(n.title))}</strong><small>${esc(L(n.text))}</small></span><span class="go">${icon('right', 'sm')}</span></a>`).join('')}</div>
      </div></section>

      <section class="sec alt" id="productos"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('prod_k')}</div><h2>${t('prod_t')}</h2><p>${t('prod_p')}</p></div></div>
        ${cats.filter((c) => inCat(c.id).length).map((c, i) => `
          <div class="cat-block reveal" style="--c:${c.color}" id="cat-${c.id}">
            <div class="cat-title"><span class="ico">${icon(c.icon, 'lg')}</span><div><div class="num">${String(i + 1).padStart(2, '0')}${c.brand ? ' · ' + esc(c.brand) : ''}</div><h3>${esc(L(c.name))}</h3><p>${esc(L(c.tagline))}</p></div><a href="#/c/${c.id}">${t('see_all')} ${icon('arrow', 'sm')}</a></div>
            <div class="grid-p">${inCat(c.id).map(card).join('')}</div>
          </div>`).join('')}
      </div></section>

      <section class="sec"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('how_k')}</div><h2>${t('how_t')}</h2></div></div>
        <div class="steps">${[['bookmark', 's1'], ['chat', 's2'], ['home', 's3']].map(([ic, k]) => `<div class="step reveal"><span class="ico">${icon(ic)}</span><h3>${t(k)}</h3><p>${t(k + 'p')}</p></div>`).join('')}</div>
      </div></section>

      <section class="sec alt" id="testimonios"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('rev_k')}</div><h2>${t('rev_t')}</h2><p>${t('rev_p')}</p></div><button class="btn ghost" data-review>${icon('star', 'sm')} ${t('rev_add')}</button></div>
        <div id="reviews">${reviewsHTML()}</div>
      </div></section>

      <section class="sec" id="oportunidades"><div class="wrap">
        <div class="opp reveal">
          <div>
            <div class="kicker">${t('job_k')}</div>
            <h2>${t('job_t')}</h2>
            <p>${t('job_p')}</p>
            <ul>${['job_b1', 'job_b2', 'job_b3', 'job_b4'].map((k) => `<li>${icon('check', 'sm')}${t(k)}</li>`).join('')}</ul>
            <a class="place" href="${esc(ct.mapsUrl)}" target="_blank" rel="noopener">${icon('pin')} ${t('job_place')}</a>
          </div>
          <div class="opp-card"><h3>${t('job_form_t')}</h3><p>${t('job_form_p')}</p>${jobForm()}</div>
        </div>
      </div></section>

      <section class="sec alt" id="contacto"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('contact_k')}</div><h2>${t('contact_t')}</h2></div></div>
        <div class="contact">
          <div class="contact-card reveal"><div class="contact-list">
            ${ct.phone ? `<a href="tel:${esc(ct.phone)}"><span class="ico">${icon('phone')}</span><span>${t('call')}<small>${esc(prettyPhone(ct.phone))}</small></span></a>` : ''}
            ${ct.whatsapp ? `<a href="${waLink()}" target="_blank" rel="noopener"><span class="ico">${icon('wa')}</span><span>WhatsApp<small>${esc(prettyPhone(ct.whatsapp))}</small></span></a>` : ''}
            <a href="${esc(ct.mapsUrl)}" target="_blank" rel="noopener"><span class="ico">${icon('pin')}</span><span>${t('visit')}: ${esc(ct.location)}<small>${esc(ct.address)}</small></span></a>
            ${ct.email ? `<a href="mailto:${esc(ct.email)}"><span class="ico">${icon('mail')}</span><span>${t('write')}<small>${esc(ct.email)}</small></span></a>` : ''}
          </div></div>
          <div class="cta-band reveal"><h3>${t('band_t')}</h3><p>${t('band_p')}</p><div><button class="btn white" data-lead="">${t('demo')} ${icon('arrow', 'sm')}</button></div></div>
        </div>
      </div></section>`;
  }

  function categoryPage(id) {
    const c = catById(id);
    if (!c) return notFound();
    return `
      <section class="page-head" style="--c:${c.color}"><div class="wrap">
        <div class="crumbs"><a href="#/">MQ Store</a> / <span>${esc(L(c.name))}</span></div>
        <h1><span class="ico">${icon(c.icon, 'lg')}</span>${esc(L(c.name))}</h1>
        <p>${esc(L(c.tagline))}${c.brand ? ` · <strong>${esc(c.brand)}</strong>` : ''}</p>
      </div></section>
      <section class="sec" style="padding-top:40px"><div class="wrap"><div class="grid-p">${inCat(id).map(card).join('')}</div></div></section>
      <section class="sec alt" style="padding-top:56px"><div class="wrap"><div class="cta-band reveal"><h3>${t('band_t')}</h3><p>${t('band_p')}</p><div><button class="btn white" data-lead="">${t('demo')} ${icon('arrow', 'sm')}</button></div></div></div></section>`;
  }

  function productPage(slug) {
    const p = prodBySlug(slug);
    if (!p) return notFound();
    const c = catById(p.cat);
    const pics = p.images || [];
    const rel = products.filter((x) => x.slug !== p.slug && x.cat === p.cat).concat(products.filter((x) => x.cat !== p.cat && x.featured)).slice(0, 4);
    const demoFirst = p.cta === 'demo';
    return `
      <div class="wrap" style="--c:${c.color}">
        <div class="crumbs" style="padding-top:26px"><a href="#/">MQ Store</a> / <a href="#/c/${c.id}">${esc(L(c.name))}</a> / <span>${esc(pName(p))}</span></div>
        <div class="pd">
          <div class="gallery">
            <div class="main ${pics.length ? 'zoom' : ''}" id="mainPic" data-i="0">${pics.length ? `<img src="${esc(img(pics[0], 1100))}" alt="${esc(pName(p))}">` : media(p)}
              ${pics.length > 1 ? `<button class="g-nav prev" data-gal="-1" aria-label="Anterior">${icon('left')}</button><button class="g-nav next" data-gal="1" aria-label="Siguiente">${icon('right')}</button><span class="g-count" id="gCount">1 / ${pics.length}</span>` : ''}
            </div>
            ${pics.length > 1 ? `<div class="thumbs">${pics.map((u, i) => `<button class="${i ? '' : 'on'}" data-pic="${i}" aria-label="Foto ${i + 1}"><img src="${esc(img(u, 200))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
          </div>
          <div class="pd-info">
            <div class="brand">${icon(c.icon, 'sm')} ${esc(p.brand || L(c.name))}</div>
            <h1>${esc(pName(p))}</h1>
            <div class="sub">${esc(L(p.subtitle))}</div>
            <p class="desc">${esc(L(p.desc))}</p>
            ${benefitsOf(p).length ? `<div class="ben"><h3>${t('benefits')}</h3><div class="ben-grid">${benefitsOf(p).map((b) => `<div class="ben-item"><span class="ok">${icon('check')}</span><span>${esc(b)}</span></div>`).join('')}</div></div>` : ''}
            <div class="pd-cta">
              <button class="btn primary block" data-lead="${p.slug}" data-kind="${demoFirst ? 'demo' : 'info'}">${demoFirst ? t('demo') : t('cta_full')} ${icon('arrow', 'sm')}</button>
              <div class="row2">
                <button class="btn ghost ${inList(p.slug) ? 'on' : ''}" data-save="${p.slug}" aria-pressed="${inList(p.slug)}">${icon('bookmark', 'sm')} ${t('add_list')}</button>
                ${contact.whatsapp ? `<a class="btn wa" href="${waLink(p)}" target="_blank" rel="noopener">${icon('wa', 'sm')} WhatsApp</a>` : ''}
              </div>
            </div>
            <div class="why"><div>${icon('home')}${t('why1')}</div><div>${icon('users')}${t('why2')}</div><div>${icon('pin')}${t('why3')}</div></div>
            <div class="no-price">${icon('info', 'sm')}<span>${t('no_price')}</span></div>
          </div>
        </div>
        ${p.video ? `<div class="video-box reveal"><h2>${icon('play')} ${t('video')}</h2><div class="video-frame">${videoEmbed(p.video, pName(p))}</div></div>` : ''}
        <div class="related"><h2>${t('related')}</h2><div class="grid-p">${rel.map(card).join('')}</div></div>
      </div>
      <div class="mbar"><button class="icon-btn ${inList(p.slug) ? 'on' : ''}" data-save="${p.slug}" aria-label="${t('add_list')}">${icon('bookmark', 'sm')}</button><button class="btn primary" data-lead="${p.slug}" data-kind="${demoFirst ? 'demo' : 'info'}">${demoFirst ? t('demo') : t('cta')}</button></div>`;
  }
  const notFound = () => `<div class="wrap" style="padding:100px 0;text-align:center"><h1>404</h1><p style="margin:12px 0 24px;color:var(--muted)">—</p><a class="btn primary" href="#/">MQ Store</a></div>`;

  function videoEmbed(url, title) {
    const yt = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    if (yt) return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0" title="${esc(title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    const vm = String(url).match(/vimeo\.com\/(\d+)/);
    if (vm) return `<iframe src="https://player.vimeo.com/video/${vm[1]}" title="${esc(title)}" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    return `<video src="${esc(url)}" controls preload="metadata" playsinline></video>`;
  }
  function waLink(p) {
    const n = String(contact.whatsapp || '').replace(/\D/g, '');
    const msg = p ? (lang === 'en' ? `Hi, I’m interested in ${pName(p)}.` : `Hola, me interesa ${pName(p)}.`) : (lang === 'en' ? 'Hi, I’d like more information.' : 'Hola, quisiera más información.');
    return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- Galería ---------- */
  function showPic(i) {
    const p = prodBySlug(currentSlug);
    if (!p || !p.images.length) return;
    const n = p.images.length;
    i = (i + n) % n;
    const main = $('#mainPic');
    main.dataset.i = i;
    const im = main.querySelector('img');
    im.src = img(p.images[i], 1100);
    const cnt = $('#gCount'); if (cnt) cnt.textContent = `${i + 1} / ${n}`;
    $$('[data-pic]').forEach((b) => b.classList.toggle('on', Number(b.dataset.pic) === i));
  }
  function lightbox(i) {
    const p = prodBySlug(currentSlug);
    if (!p || !p.images.length) return;
    const o = $('#overlay');
    const n = p.images.length;
    const paint = () => { o.innerHTML = `<div class="lightbox" role="dialog" aria-modal="true"><button class="modal-x lb-x" data-lb="x" aria-label="Cerrar">${icon('x')}</button>${n > 1 ? `<button class="g-nav prev" data-lb="-1" aria-label="Anterior">${icon('left')}</button><button class="g-nav next" data-lb="1" aria-label="Siguiente">${icon('right')}</button>` : ''}<img src="${esc(img(p.images[i], 1800))}" alt="${esc(pName(p))}"></div>`; };
    const close = () => { o.hidden = true; o.innerHTML = ''; document.body.classList.remove('lock'); document.removeEventListener('keydown', key); };
    const key = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') { i = (i + 1) % n; paint(); } if (e.key === 'ArrowLeft') { i = (i - 1 + n) % n; paint(); } };
    paint(); o.hidden = false; document.body.classList.add('lock');
    document.addEventListener('keydown', key);
    o.onclick = (e) => {
      const b = e.target.closest('[data-lb]');
      if (b && b.dataset.lb !== 'x') { i = (i + Number(b.dataset.lb) + n) % n; paint(); return; }
      if (b || e.target.classList.contains('lightbox')) close();
    };
  }

  /* ---------- Buscador ---------- */
  function search(q) {
    const words = norm(q).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return products.map((p) => {
      const c = catById(p.cat);
      const hay = norm([p.name, p.nameEn, p.brand, L(c.name), c.name.en, p.subtitle.es, p.subtitle.en, p.desc.es, p.desc.en, ...(p.benefits.es || []), ...(p.benefits.en || [])].join(' '));
      const title = norm([p.name, p.nameEn, p.brand].join(' '));
      let score = 0;
      for (const w of words) { if (!hay.includes(w)) return null; score += title.includes(w) ? 3 : 1; }
      return { p, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).map((x) => x.p);
  }
  function openSearch() {
    const o = $('#overlay');
    const sug = lang === 'en' ? ['water', 'softener', 'massage', 'cleaning', 'power'] : ['agua', 'suavizador', 'masaje', 'limpieza', 'energía'];
    o.innerHTML = `<div class="search-wrap"><div class="search-box" role="dialog" aria-modal="true">
      <div class="search-in">${icon('search')}<input id="sq" type="search" placeholder="${t('search_ph')}" autocomplete="off" aria-label="${t('search_btn')}"><button class="modal-x" data-sx aria-label="Cerrar">${icon('x')}</button></div>
      <div id="sres"></div></div></div>`;
    o.hidden = false; document.body.classList.add('lock');
    const inp = $('#sq'), res = $('#sres');
    const close = () => { o.hidden = true; o.innerHTML = ''; document.body.classList.remove('lock'); document.removeEventListener('keydown', key); };
    const key = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', key);
    const paint = () => {
      const q = inp.value.trim();
      if (!q) { res.innerHTML = `<div class="search-hint"><h4>${t('search_try')}</h4><div class="chips">${sug.map((s) => `<button class="chip" data-sg="${esc(s)}">${esc(s)}</button>`).join('')}</div><h4 style="margin-top:18px">${t('f_cats')}</h4><div class="chips">${cats.map((c) => `<a class="chip" href="#/c/${c.id}" data-sx>${icon(c.icon, 'sm')}${esc(L(c.name))}</a>`).join('')}</div></div>`; return; }
      const r = search(q);
      res.innerHTML = r.length ? `<div class="search-res">${r.map((p) => { const c = catById(p.cat); return `<a class="sr" href="#/p/${p.slug}" data-sx style="--c:${c.color}"><span class="th">${media(p, 160)}</span><span><strong>${esc(pName(p))}</strong><small>${esc(L(p.subtitle))} · ${esc(L(c.name))}</small></span></a>`; }).join('')}</div>`
        : `<div class="search-hint"><p style="color:var(--muted)">${t('search_none')}</p><h4 style="margin-top:16px">${t('search_try')}</h4><div class="chips">${sug.map((s) => `<button class="chip" data-sg="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
    };
    inp.addEventListener('input', paint);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const a = res.querySelector('.sr'); if (a) { location.hash = a.getAttribute('href'); close(); } } });
    o.onclick = (e) => {
      const sg = e.target.closest('[data-sg]');
      if (sg) { inp.value = sg.dataset.sg; paint(); inp.focus(); return; }
      if (e.target.closest('[data-sx]') || e.target.classList.contains('search-wrap')) close();
    };
    paint();
    setTimeout(() => inp.focus(), 30);
  }

  /* ---------- Reseñas (solo las aprobadas en el CRM) ---------- */
  let reviews = null;
  function reviewsHTML() {
    if (reviews && reviews.length) {
      return `<div class="reviews">${reviews.map((r) => `
        <figure class="review reveal">
          <div class="stars" aria-label="${r.rating} / 5">${Array.from({ length: 5 }, (_, i) => `<span style="opacity:${i < r.rating ? 1 : .25}">${icon('star')}</span>`).join('')}</div>
          <blockquote>“${esc(r.text)}”</blockquote>
          <figcaption class="who"><span class="av">${esc((r.name || '?').trim()[0].toUpperCase())}</span><span><strong>${esc(r.name)}</strong><small>${esc([r.productName, r.city].filter(Boolean).join(' · '))}</small></span></figcaption>
        </figure>`).join('')}</div>`;
    }
    return `<div class="empty-rev reveal"><span class="ico">${icon('star', 'lg')}</span><div><h3>${t('rev_empty_t')}</h3><p>${t('rev_empty_p')}</p></div><button class="btn primary" data-review>${t('rev_add')}</button></div>`;
  }
  async function loadReviews() {
    try {
      const { db, fs } = await firebase();
      const snap = await fs.getDocs(fs.query(fs.collection(db, 'reviews'), fs.orderBy('createdAt', 'desc'), fs.limit(12)));
      reviews = snap.docs.map((d) => d.data()).filter((r) => r.text && r.name).map((r) => Object.assign(r, { rating: Math.max(1, Math.min(5, Number(r.rating) || 5)) }));
    } catch (e) { reviews = []; console.warn('Reseñas:', e.message); }
    const box = $('#reviews');
    if (box) { box.innerHTML = reviewsHTML(); reveal(box); }
  }

  /* ---------- Firebase (se carga solo cuando hace falta) ---------- */
  let fb = null;
  function firebase() {
    if (!fb) {
      fb = (async () => {
        const app = await import(SDK + 'firebase-app.js');
        const fs = await import(SDK + 'firebase-firestore.js');
        const a = app.getApps().find((x) => x.name === 'mqstore') || app.initializeApp(CFG.firebase, 'mqstore');
        return { db: fs.getFirestore(a), fs };
      })();
      fb.catch(() => { fb = null; });
    }
    return fb;
  }
  // Fotos, textos y productos editados en el CRM (se guardan para la próxima visita)
  async function loadCatalog() {
    try {
      const { db, fs } = await firebase();
      const snap = await fs.getDocs(fs.collection(db, 'catalog'));
      const over = {};
      snap.docs.forEach((d) => { over[d.id] = d.data(); });
      const before = JSON.stringify(store.get('mq_catalog_cache', null));
      store.set('mq_catalog_cache', over);
      if (JSON.stringify(over) !== before) { build(over); const y = window.scrollY; render(); window.scrollTo(0, y); }
    } catch (e) { console.warn('Catálogo:', e.message); }
  }
  async function sendLead(data) {
    const { db, fs } = await firebase();
    const clean = {};
    Object.entries(data).forEach(([k, v]) => { if (v !== '' && v != null && !(Array.isArray(v) && !v.length)) clean[k] = v; });
    Object.assign(clean, { lang, page: (location.hash || '#/').slice(0, 120), status: 'nuevo', createdAt: fs.serverTimestamp() });
    if (ref()) clean.ref = ref();
    await fs.addDoc(fs.collection(db, 'webLeads'), clean);
  }

  /* ---------- Ventanas y formularios ---------- */
  function modal(html, onOpen) {
    const w = $('#modal');
    w.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
    w.hidden = false;
    document.body.classList.add('lock');
    const close = () => { w.hidden = true; w.innerHTML = ''; document.body.classList.remove('lock'); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    w.onclick = (e) => { if (e.target === w || e.target.closest('[data-close]')) close(); };
    if (onOpen) onOpen(w.querySelector('.modal'), close);
    setTimeout(() => { const f = w.querySelector('.form input:not([name=website])'); if (f && window.innerWidth > 680) f.focus(); }, 60);
    return close;
  }
  const head = (title, sub) => `<div class="modal-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="modal-x" data-close aria-label="Cerrar">${icon('x')}</button></div>`;
  const doneHTML = (title, text, btn = true) => `<div class="done"><span class="ok">${icon('check')}</span><h3>${title}</h3><p>${text}</p>${btn ? `<button class="btn primary" data-close style="margin-top:8px">${t('f_close')}</button>` : ''}</div>`;
  const validPhone = (v) => { const d = String(v || '').replace(/\D/g, ''); return d.length === 10 || (d.length === 11 && d[0] === '1'); };
  const fieldsHTML = () => `
    <label class="field">${t('f_name')}<input name="name" autocomplete="name" required maxlength="80"></label>
    <div class="two">
      <label class="field">${t('f_phone')}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" placeholder="(407) 555-0123"></label>
      <label class="field">${t('f_email')} <span class="opt">${t('f_opt')}</span><input name="email" type="email" autocomplete="email" maxlength="120"></label>
    </div>`;
  const hp = '<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>';

  function openLead(slugs, kind) {
    const chosen = (slugs || []).map(prodBySlug).filter(Boolean);
    const k = kind || (chosen.some((p) => p.cta === 'demo') ? 'demo' : 'info');
    modal(`${head(t('f_title_info'), t('f_sub'))}
      <div class="modal-body"><form class="form" novalidate>
        ${chosen.length ? `<div class="field">${t('f_products')}<div class="pchips">${chosen.map((p) => `<span class="pchip">${esc(pName(p))}</span>`).join('')}</div></div>` : ''}
        ${fieldsHTML()}
        <div class="two">
          <label class="field">${t('f_city')} <span class="opt">${t('f_opt')}</span><input name="city" autocomplete="address-level2" maxlength="80"></label>
          <label class="field">${t('f_time')}<select name="bestTime">${t('times').map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>
        </div>
        <div class="field">${t('f_want')}<div class="seg">
          <label><input type="radio" name="interest" value="info" ${k === 'info' ? 'checked' : ''}>${icon('info', 'sm')}${t('f_info')}</label>
          <label><input type="radio" name="interest" value="demo" ${k === 'demo' ? 'checked' : ''}>${icon('home', 'sm')}${t('f_demo')}</label>
        </div></div>
        ${chosen.length ? '' : `<label class="field">${t('f_products')} <span class="opt">${t('f_opt')}</span><select name="product"><option value="">—</option>${cats.map((c) => `<optgroup label="${esc(L(c.name))}">${inCat(c.id).map((p) => `<option value="${p.slug}">${esc(pName(p))}</option>`).join('')}</optgroup>`).join('')}</select></label>`}
        <label class="field">${t('f_msg')} <span class="opt">${t('f_opt')}</span><textarea name="message" maxlength="1000" placeholder="${t('f_msg_ph')}"></textarea></label>
        <label class="check"><input type="checkbox" name="consent" checked>${t('f_consent')}</label>
        ${hp}
        <button class="btn primary block" type="submit">${t('f_send')}</button>
      </form></div>`, (m) => {
      const f = m.querySelector('form');
      f.onsubmit = async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(f));
        if (d.website) return;
        if (!d.name.trim() || !validPhone(d.phone)) { f.phone.classList.toggle('bad', !validPhone(d.phone)); return toast(t('f_req'), true); }
        if (!f.consent.checked) return toast(t('f_req_c'), true);
        const sl = chosen.length ? chosen.map((p) => p.slug) : (d.product ? [d.product] : []);
        const ok = await submit(f, () => sendLead({
          type: d.interest === 'demo' ? 'demo' : 'info', interest: d.interest, name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), city: d.city.trim(),
          bestTime: d.bestTime, message: d.message.trim(), products: sl, productNames: sl.map((s) => prodBySlug(s).name), consent: true
        }), m, t('f_ok_t'), t('f_ok_p'));
        if (ok && chosen.length && chosen.every((p) => inList(p.slug))) { list = list.filter((s) => !chosen.some((p) => p.slug === s)); store.set('mq_list', list); paintList(); }
      };
    });
  }

  function jobForm() {
    return `<form class="form" id="jobForm" novalidate>
      ${fieldsHTML()}
      <div class="two">
        <label class="field">${t('f_city')} <span class="opt">${t('f_opt')}</span><input name="city" maxlength="80"></label>
        <label class="field">${t('j_lang')}<select name="languages"><option>Español</option><option>English</option><option>Español / English</option></select></label>
      </div>
      <label class="field">${t('j_exp')} <span class="opt">${t('f_opt')}</span><textarea name="experience" maxlength="1000" rows="2"></textarea></label>
      ${hp}
      <button class="btn primary block" type="submit">${t('job_send')}</button>
    </form>`;
  }
  function bindJobForm() {
    const f = $('#jobForm');
    if (!f) return;
    f.onsubmit = async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (d.website) return;
      if (!d.name.trim() || !validPhone(d.phone)) { f.phone.classList.toggle('bad', !validPhone(d.phone)); return toast(t('f_req'), true); }
      await submit(f, () => sendLead({ type: 'empleo', name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), city: d.city.trim(), languages: d.languages, experience: d.experience.trim(), consent: true }), f.closest('.opp-card'), t('j_ok_t'), t('j_ok_p'), true);
    };
  }

  function openReview() {
    let rating = 0;
    modal(`${head(t('r_title'), t('r_sub'))}
      <div class="modal-body"><form class="form" novalidate>
        <div class="field">${t('r_rating')}<div class="rate" role="radiogroup">${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-r="${n}" aria-label="${n}">${icon('star')}</button>`).join('')}</div></div>
        <div class="two">
          <label class="field">${t('f_name')}<input name="name" required maxlength="80"></label>
          <label class="field">${t('f_city')} <span class="opt">${t('f_opt')}</span><input name="city" maxlength="80"></label>
        </div>
        <label class="field">${t('r_product')}<select name="product"><option value="">—</option>${products.map((p) => `<option value="${p.slug}">${esc(pName(p))}</option>`).join('')}</select></label>
        <label class="field">${t('r_text')}<textarea name="message" maxlength="1000" required></textarea></label>
        <label class="field">${t('f_phone')} <span class="opt">${t('f_opt')}</span><input name="phone" type="tel" maxlength="20"></label>
        ${hp}
        <button class="btn primary block" type="submit">${t('r_send')}</button>
      </form></div>`, (m) => {
      const f = m.querySelector('form');
      const paint = () => $$('[data-r]', m).forEach((b) => b.classList.toggle('on', Number(b.dataset.r) <= rating));
      $$('[data-r]', m).forEach((b) => { b.onclick = () => { rating = Number(b.dataset.r); paint(); }; });
      f.onsubmit = async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(f));
        if (d.website) return;
        if (!d.name.trim() || !d.message.trim() || !rating) return toast(t('r_req'), true);
        const p = prodBySlug(d.product);
        await submit(f, () => sendLead({ type: 'resena', name: d.name.trim(), city: d.city.trim(), message: d.message.trim(), rating, phone: d.phone.trim(), products: p ? [p.slug] : [], productNames: p ? [p.name] : [] }), m, t('r_ok_t'), t('r_ok_p'));
      };
    });
  }

  async function submit(form, fn, box, okT, okP, inline) {
    const btn = form.querySelector('[type=submit]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = t('f_sending');
    try {
      await fn();
      box.innerHTML = doneHTML(okT, okP, !inline);
      return true;
    } catch (e) {
      console.error(e);
      toast(t('f_err'), true);
      btn.disabled = false; btn.textContent = label;
      return false;
    }
  }

  function openList() {
    const d = $('#drawer');
    const paint = () => {
      const items = list.map(prodBySlug).filter(Boolean);
      d.innerHTML = `<div class="drawer-in" role="dialog" aria-modal="true" aria-label="${t('list_t')}">
        <div class="drawer-head"><h2>${t('list_t')}</h2><button class="modal-x" data-dclose aria-label="Cerrar">${icon('x')}</button></div>
        <div class="drawer-body">${items.length ? items.map((p) => `<div class="li" style="--c:${catById(p.cat).color}"><a class="thumb" href="#/p/${p.slug}" data-dclose>${media(p, 160)}</a><div><strong>${esc(pName(p))}</strong><small>${esc(L(p.subtitle))}</small></div><button class="li-x" data-rm="${p.slug}" aria-label="Quitar">${icon('x', 'sm')}</button></div>`).join('') : `<div class="empty">${icon('bookmark', 'lg')}<p>${t('list_empty')}</p></div>`}</div>
        <div class="drawer-foot">${items.length ? `<button class="btn primary block" data-send>${t('list_send')}</button>` : ''}<button class="btn ghost block" data-dclose>${t('list_keep')}</button></div>
      </div>`;
    };
    paint();
    d.hidden = false;
    d.onclick = (e) => {
      if (e.target === d || e.target.closest('[data-dclose]')) { d.hidden = true; return; }
      const rm = e.target.closest('[data-rm]');
      if (rm) { toggleList(rm.dataset.rm); paint(); return; }
      if (e.target.closest('[data-send]')) { d.hidden = true; openLead(list.slice()); }
    };
  }

  /* ---------- Aviso ---------- */
  let tt;
  function toast(msg, bad) { const el = $('#toast'); el.textContent = msg; el.className = 'toast show' + (bad ? ' bad' : ''); clearTimeout(tt); tt = setTimeout(() => { el.className = 'toast'; }, 2600); }

  /* ---------- Animación al aparecer ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px 0px' }) : null;
  function reveal(root = document) { $$('.reveal:not(.in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('in'))); }

  /* ---------- Navegación ---------- */
  let pendingScroll = null;
  let currentSlug = '';
  function route(keepScroll) {
    const h = location.hash.replace(/^#\/?/, '');
    const [kind, id] = h.split('/');
    const main = $('#main');
    currentSlug = kind === 'p' ? id : '';
    if (kind === 'c') { main.innerHTML = categoryPage(id); catbar(id); document.title = `${L((catById(id) || {}).name) || ''} · MQ Store`; }
    else if (kind === 'p') { const p = prodBySlug(id); main.innerHTML = productPage(id); catbar(p && p.cat); document.title = p ? `${pName(p)} · MQ Store` : 'MQ Store'; }
    else { main.innerHTML = home(); catbar(''); document.title = lang === 'en' ? 'MQ Store · Pure water, wellness and technology for your home' : 'MQ Store · Agua pura, bienestar y tecnología para tu hogar'; bindJobForm(); if (reviews === null) loadReviews(); }
    document.body.classList.toggle('has-mbar', kind === 'p');
    if (pendingScroll) { const el = document.getElementById(pendingScroll); pendingScroll = null; if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 30); }
    else if (!keepScroll) window.scrollTo(0, 0);
    reveal(main);
  }
  function render() { header(); footer(); route(true); paintList(); waFloat(); }
  function waFloat() {
    let a = $('.wa-float');
    if (!contact.whatsapp) { if (a) a.remove(); return; }
    if (!a) { document.body.insertAdjacentHTML('beforeend', `<a class="wa-float" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a>`); a = $('.wa-float'); }
    a.href = waLink();
  }

  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      const id = go.dataset.go;
      const el = document.getElementById(id);
      if (el && !location.hash.replace(/^#\/?/, '')) el.scrollIntoView({ behavior: 'smooth' });
      else { pendingScroll = id; if (location.hash === '#/' || !location.hash) route(); else location.hash = '#/'; }
      return;
    }
    const lead = e.target.closest('[data-lead]');
    if (lead) { e.preventDefault(); openLead(lead.dataset.lead ? [lead.dataset.lead] : [], lead.dataset.kind); return; }
    const save = e.target.closest('[data-save]');
    if (save) { e.preventDefault(); toggleList(save.dataset.save); return; }
    if (e.target.closest('[data-review]')) { openReview(); return; }
    if (e.target.closest('[data-search]')) { openSearch(); return; }
    const gal = e.target.closest('[data-gal]');
    if (gal) { e.stopPropagation(); showPic(Number($('#mainPic').dataset.i) + Number(gal.dataset.gal)); return; }
    const pic = e.target.closest('[data-pic]');
    if (pic) { showPic(Number(pic.dataset.pic)); return; }
    if (e.target.closest('#mainPic.zoom') && e.target.tagName === 'IMG') lightbox(Number($('#mainPic').dataset.i));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName) && $('#overlay').hidden && $('#modal').hidden) { e.preventDefault(); openSearch(); }
  });
  $('#langBtn').onclick = () => { lang = lang === 'es' ? 'en' : 'es'; store.set('mq_lang', lang); render(); };
  $('#listBtn').onclick = openList;
  $('#searchPill').onclick = openSearch;
  $('#searchBtn').onclick = openSearch;
  $('#ctaTop').onclick = () => openLead(list.slice());
  window.addEventListener('hashchange', () => route());
  header(); footer(); route(); paintList(); waFloat();
  loadCatalog();
})();
