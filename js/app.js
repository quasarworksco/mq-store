/* =========================================================
   MQ Store — catálogo conectado al CRM
   ---------------------------------------------------------
   - Navegación por categorías y fichas de producto (#/c/…, #/p/…).
   - Español / inglés.
   - "Mi lista": varios productos en una sola solicitud.
   - Cada formulario crea un documento en Firestore (colección webLeads).
     El CRM lo convierte en prospecto (o candidato, o reseña por aprobar).
   - Nunca se muestran precios.
   ========================================================= */
(() => {
  const CFG = window.MQ_CONFIG;
  const DATA = window.MQ_DATA;
  const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';

  /* ---------- Utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const ICONS = {
    drop: '<path d="M12 2.7s-6 6.4-6 11.3a6 6 0 0 0 12 0C18 9.1 12 2.7 12 2.7z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
    sparkle: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    pot: '<path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 10h20M9 6c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v4H9z"/>',
    chair: '<path d="M7 3h6a4 4 0 0 1 4 4v6H9a2 2 0 0 1-2-2z"/><path d="M5 13h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM7 18l-1 3M17 18l1 3"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10 16-10 0 9-4 16-10 16z"/><path d="M4 21c4-6 8-9 13-12"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    home: '<path d="M3 10.5L12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    bookmark: '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>',
    wa: '<path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.2-1.8-1-1 .8a4 4 0 0 1-2.5-2.5l.8-1-1-1.8z"/>'
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- Idioma ---------- */
  const T = {
    es: {
      nav_products: 'Productos', nav_reviews: 'Testimonios', nav_jobs: 'Trabaja con nosotros', nav_contact: 'Contacto',
      cta: 'Solicitar información', cta_full: 'Solicitar información o demostración', demo: 'Solicitar una demostración',
      hero_kicker: 'The Florida Mall · Orlando',
      hero_title: 'Agua pura, bienestar y <em>tecnología</em> para tu hogar',
      hero_lead: 'Conoce nuestras soluciones para el agua, la limpieza, el descanso, el exterior y la energía de tu hogar. Te asesoramos y te mostramos cómo funcionan, sin compromiso.',
      see_catalog: 'Ver catálogo', hero_m1: 'Demostración sin costo', hero_m2: 'Asesoría personalizada', hero_m3: 'Español e inglés',
      t1: 'Demostración sin costo', t1s: 'Te mostramos cómo funciona', t2: 'Asesoría personalizada', t2s: 'Según las necesidades de tu hogar',
      t3: 'The Florida Mall', t3s: 'Orlando, Florida', t4: 'Atención bilingüe', t4s: 'Español e inglés',
      cats_k: 'Catálogo', cats_t: 'Explora por categoría', cats_p: 'Elige una categoría y conoce cada producto: qué es, para qué sirve y sus beneficios.',
      products_n: (n) => `${n} ${n === 1 ? 'producto' : 'productos'}`, explore: 'Explorar', see_all: 'Ver todos',
      prod_k: 'Productos', prod_t: 'Nuestros productos', prod_p: 'Sin precios publicados: cada solución se adapta a tu hogar. Solicita información y te contactamos.',
      how_k: 'Así de fácil', how_t: '¿Cómo funciona?',
      s1: 'Elige lo que te interesa', s1p: 'Explora el catálogo y agrega a tu lista los productos que quieras conocer.',
      s2: 'Solicita información', s2p: 'Déjanos tus datos y un asesor te contacta para resolver tus dudas.',
      s3: 'Vive la demostración', s3p: 'Agenda una demostración y comprueba cómo funciona antes de decidir.',
      rev_k: 'Testimonios', rev_t: 'Lo que dicen nuestros clientes', rev_p: 'Experiencias reales de familias que ya disfrutan nuestros productos.',
      rev_empty_t: 'Muy pronto compartiremos las experiencias de nuestros clientes', rev_empty_p: '¿Ya tienes alguno de nuestros productos? Cuéntanos cómo te ha ido.',
      rev_add: 'Dejar mi reseña',
      job_k: 'Oportunidades', job_t: 'Crece con nosotros en ventas',
      job_p: '¿Te apasionan las ventas y el servicio al cliente? Buscamos personas con ganas de crecer para unirse a nuestro equipo.',
      job_b1: 'Capacitación en nuestros productos', job_b2: 'Trabajo en equipo', job_b3: 'Oportunidades de crecimiento', job_b4: 'Español e inglés',
      job_place: 'Estamos en The Florida Mall, Orlando', job_form_t: 'Me interesa trabajar con ustedes', job_form_p: 'Déjanos tus datos y te contactamos.',
      job_send: 'Enviar mis datos',
      contact_k: 'Contacto', contact_t: 'Visítanos o escríbenos', call: 'Llámanos', visit: 'Visítanos', write: 'Escríbenos', whatsapp: 'WhatsApp',
      band_t: '¿Quieres conocer un producto en persona?', band_p: 'Agenda una demostración sin costo y resuelve todas tus dudas.',
      benefits: 'Beneficios principales', video: 'Video demostrativo', related: 'También te puede interesar', back: 'Volver',
      no_price: 'Precio según tu hogar y el sistema que elijas. Solicita información y te asesoramos.',
      add_list: 'Agregar a mi lista', in_list: 'En mi lista', added: 'Agregado a tu lista', removed: 'Quitado de tu lista',
      list_t: 'Mi lista', list_empty: 'Aún no has agregado productos. Usa el botón de guardar en cada producto.', list_send: 'Solicitar información de mi lista', list_keep: 'Seguir viendo',
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
      f_cats: 'Categorías', f_company: 'MQ Store', rights: 'Todos los derechos reservados.', other: 'Otro'
    },
    en: {
      nav_products: 'Products', nav_reviews: 'Reviews', nav_jobs: 'Careers', nav_contact: 'Contact',
      cta: 'Request information', cta_full: 'Request information or a demo', demo: 'Request a demonstration',
      hero_kicker: 'The Florida Mall · Orlando',
      hero_title: 'Pure water, wellness and <em>technology</em> for your home',
      hero_lead: 'Discover our solutions for your home’s water, cleaning, relaxation, outdoors and energy. We advise you and show you how they work, with no obligation.',
      see_catalog: 'Browse catalog', hero_m1: 'Free demonstration', hero_m2: 'Personalized advice', hero_m3: 'Spanish & English',
      t1: 'Free demonstration', t1s: 'We show you how it works', t2: 'Personalized advice', t2s: 'Based on your home’s needs',
      t3: 'The Florida Mall', t3s: 'Orlando, Florida', t4: 'Bilingual service', t4s: 'Spanish & English',
      cats_k: 'Catalog', cats_t: 'Shop by category', cats_p: 'Pick a category and get to know each product: what it is, what it does and its benefits.',
      products_n: (n) => `${n} ${n === 1 ? 'product' : 'products'}`, explore: 'Explore', see_all: 'See all',
      prod_k: 'Products', prod_t: 'Our products', prod_p: 'No published prices: every solution is tailored to your home. Request information and we’ll reach out.',
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
      job_place: 'We’re at The Florida Mall, Orlando', job_form_t: 'I’m interested in working with you', job_form_p: 'Leave your details and we’ll contact you.',
      job_send: 'Send my details',
      contact_k: 'Contact', contact_t: 'Visit or contact us', call: 'Call us', visit: 'Visit us', write: 'Email us', whatsapp: 'WhatsApp',
      band_t: 'Want to see a product in person?', band_p: 'Book a free demonstration and get all your questions answered.',
      benefits: 'Key benefits', video: 'Demo video', related: 'You may also like', back: 'Back',
      no_price: 'Pricing depends on your home and the system you choose. Request information and we’ll advise you.',
      add_list: 'Save to my list', in_list: 'In my list', added: 'Saved to your list', removed: 'Removed from your list',
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
      f_cats: 'Categories', f_company: 'MQ Store', rights: 'All rights reserved.', other: 'Other'
    }
  };
  let lang = store.get('mq_lang', 'es') === 'en' ? 'en' : 'es';
  const t = (k, ...a) => { const v = T[lang][k]; return typeof v === 'function' ? v(...a) : v; };
  const L = (o) => (o && typeof o === 'object' ? o[lang] || o.es : o || '');

  /* ---------- Datos ---------- */
  const cats = DATA.categories;
  const products = DATA.products;
  const catById = (id) => cats.find((c) => c.id === id);
  const prodBySlug = (s) => products.find((p) => p.slug === s);
  const pName = (p) => (lang === 'en' && p.nameEn) || p.name;
  const inCat = (id) => products.filter((p) => p.cat === id);

  // Imagen del producto, o una imagen provisional con los colores de su categoría
  function media(p, cls = '') {
    if (p.image) return `<img src="${esc(p.image)}" alt="${esc(pName(p))}" loading="lazy" class="${cls}">`;
    const c = catById(p.cat);
    return `<div class="ph ${cls}" style="--c:${c.color}" role="img" aria-label="${esc(pName(p))}"><div class="ph-in"><div class="ph-ico">${icon(c.icon)}</div><div class="ph-name">${esc(p.brand || pName(p))}</div></div></div>`;
  }

  /* ---------- Atribución: enlace de cada agente (?a=valeria) ---------- */
  (function captureRef() {
    const q = new URLSearchParams(location.search);
    const r = (q.get('a') || q.get('ref') || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
    if (r) store.set('mq_ref', { r, at: Date.now() });
  })();
  const ref = () => { const v = store.get('mq_ref', null); return v && Date.now() - v.at < 30 * 864e5 ? v.r : ''; };

  /* ---------- Mi lista ---------- */
  let list = store.get('mq_list', []).filter((s) => prodBySlug(s));
  const inList = (s) => list.includes(s);
  function toggleList(s) {
    if (inList(s)) { list = list.filter((x) => x !== s); toast(t('removed')); } else { list.push(s); toast(t('added')); }
    store.set('mq_list', list);
    paintList();
    $$(`[data-save="${s}"]`).forEach((b) => { b.classList.toggle('on', inList(s)); b.setAttribute('aria-pressed', inList(s)); });
  }
  function paintList() { const c = $('#listCount'); c.textContent = list.length; c.hidden = !list.length; }

  /* ---------- Componentes ---------- */
  const card = (p) => {
    const c = catById(p.cat);
    return `<article class="card-p reveal">
      <a class="media" href="#/p/${p.slug}" aria-label="${esc(pName(p))}">${media(p)}${p.video ? `<span class="badge video">${icon('play', 'sm')} Video</span>` : ''}</a>
      <div class="body">
        <div class="brand">${esc(p.brand || L(c.name))}</div>
        <h4><a href="#/p/${p.slug}" style="color:inherit">${esc(pName(p))}</a></h4>
        <div class="sub">${esc(L(p.subtitle))}</div>
        <ul>${L(p.benefits).slice(0, 3).map((b) => `<li>${icon('check', 'sm')}<span>${esc(b)}</span></li>`).join('')}</ul>
        <div class="actions">
          <button class="btn primary sm" data-lead="${p.slug}">${t('cta')}</button>
          <button class="icon-btn ${inList(p.slug) ? 'on' : ''}" data-save="${p.slug}" aria-pressed="${inList(p.slug)}" title="${t('add_list')}" aria-label="${t('add_list')}">${icon('bookmark', 'sm')}</button>
        </div>
      </div>
    </article>`;
  };

  function nav() {
    $('#nav').innerHTML = `
      <a href="#/" data-go="productos">${t('nav_products')}</a>
      <a href="#/" data-go="testimonios">${t('nav_reviews')}</a>
      <a href="#/" data-go="oportunidades">${t('nav_jobs')}</a>
      <a href="#/" data-go="contacto">${t('nav_contact')}</a>`;
    $('#ctaTop').textContent = t('cta');
    $('#langBtn').textContent = lang === 'es' ? 'EN' : 'ES';
    document.documentElement.lang = lang;
  }

  function footer() {
    const ct = CFG.contact;
    $('#foot').innerHTML = `<div class="wrap">
      <div class="foot-in">
        <div><a class="logo" href="#/"><span class="logo-mark">MQ</span><span class="logo-text">MQ <b>Store</b></span></a><p>${t('footer_p')}</p></div>
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

  /* ---------- Páginas ---------- */
  function home() {
    const ct = CFG.contact;
    const feat = ['agua', 'limpieza', 'relajacion', 'energia'].map((c) => products.find((p) => p.cat === c && p.featured) || inCat(c)[0]).filter(Boolean);
    return `
      <section class="hero">
        <div class="wrap hero-in">
          <div>
            <span class="eyebrow"><span class="dot"></span>${t('hero_kicker')}</span>
            <h1>${t('hero_title')}</h1>
            <p class="lead">${t('hero_lead')}</p>
            <div class="hero-ctas">
              <a class="btn white" href="#/" data-go="productos">${t('see_catalog')} ${icon('arrow', 'sm')}</a>
              <button class="btn outline-w" data-lead="">${t('demo')}</button>
            </div>
            <div class="hero-meta"><span>${icon('check', 'sm')}${t('hero_m1')}</span><span>${icon('check', 'sm')}${t('hero_m2')}</span><span>${icon('check', 'sm')}${t('hero_m3')}</span></div>
          </div>
          <div class="mosaic" aria-hidden="true">${feat.map((p) => `<div class="tile">${media(p)}</div>`).join('')}</div>
        </div>
      </section>

      <section class="trust"><div class="wrap trust-in">
        ${[['calendar', 't1', 't1s'], ['users', 't2', 't2s'], ['pin', 't3', 't3s'], ['globe', 't4', 't4s']].map(([i, a, b]) => `<div class="trust-item"><span class="ico">${icon(i)}</span><span>${t(a)}<small>${t(b)}</small></span></div>`).join('')}
      </div></section>

      <section class="sec" id="categorias"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('cats_k')}</div><h2>${t('cats_t')}</h2><p>${t('cats_p')}</p></div></div>
        <div class="cats">${cats.map((c) => `
          <a class="cat-card reveal" href="#/c/${c.id}" style="--c:${c.color}">
            <span class="n">${t('products_n', inCat(c.id).length)}</span>
            <div><span class="ico">${icon(c.icon, 'lg')}</span><h3>${esc(L(c.name))}</h3><p>${esc(L(c.tagline))}</p></div>
            <span class="more">${t('explore')} ${icon('arrow', 'sm')}</span>
          </a>`).join('')}</div>
      </div></section>

      <section class="sec alt" id="productos"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('prod_k')}</div><h2>${t('prod_t')}</h2><p>${t('prod_p')}</p></div></div>
        ${cats.map((c) => `
          <div class="cat-block">
            <div class="cat-title reveal" style="--c:${c.color}"><span class="ico">${icon(c.icon)}</span><div><h3>${esc(L(c.name))}</h3><p>${esc(L(c.tagline))}</p></div><a href="#/c/${c.id}">${t('see_all')} →</a></div>
            <div class="grid-p">${inCat(c.id).map(card).join('')}</div>
          </div>`).join('')}
      </div></section>

      <section class="sec"><div class="wrap">
        <div class="sec-head reveal"><div><div class="kicker">${t('how_k')}</div><h2>${t('how_t')}</h2></div></div>
        <div class="steps">${[['bookmark', 's1'], ['chat', 's2'], ['home', 's3']].map(([i, k]) => `<div class="step reveal"><span class="ico">${icon(i)}</span><h3>${t(k)}</h3><p>${t(k + 'p')}</p></div>`).join('')}</div>
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
            ${ct.whatsapp ? `<a href="${waLink()}" target="_blank" rel="noopener"><span class="ico">${icon('wa')}</span><span>${t('whatsapp')}<small>${esc(prettyPhone(ct.whatsapp))}</small></span></a>` : ''}
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
        <p>${esc(L(c.tagline))}</p>
        <div class="chips">${cats.map((x) => `<a class="chip ${x.id === id ? 'on' : ''}" href="#/c/${x.id}">${esc(L(x.name))}</a>`).join('')}</div>
      </div></section>
      <section class="sec" style="padding-top:44px"><div class="wrap"><div class="grid-p">${inCat(id).map(card).join('')}</div></div></section>`;
  }

  function productPage(slug) {
    const p = prodBySlug(slug);
    if (!p) return notFound();
    const c = catById(p.cat);
    const pics = [p.image, ...(p.gallery || [])].filter(Boolean);
    const rel = products.filter((x) => x.slug !== p.slug && x.cat === p.cat).concat(products.filter((x) => x.cat !== p.cat && x.featured)).slice(0, 4);
    const demoFirst = p.cta === 'demo';
    return `
      <div class="wrap">
        <div class="crumbs" style="padding-top:28px"><a href="#/">MQ Store</a> / <a href="#/c/${c.id}">${esc(L(c.name))}</a> / <span>${esc(pName(p))}</span></div>
        <div class="pd">
          <div class="gallery">
            <div class="main" id="mainPic">${media(p)}</div>
            ${pics.length > 1 ? `<div class="thumbs">${pics.map((u, i) => `<button class="${i ? '' : 'on'}" data-pic="${esc(u)}" aria-label="Foto ${i + 1}"><img src="${esc(u)}" alt=""></button>`).join('')}</div>` : ''}
          </div>
          <div class="pd-info">
            <div class="brand">${esc(p.brand || '')}${p.brand ? ' · ' : ''}${esc(L(c.name))}</div>
            <h1>${esc(pName(p))}</h1>
            <div class="sub">${esc(L(p.subtitle))}</div>
            <p class="desc">${esc(L(p.desc))}</p>
            <div class="ben"><h3>${t('benefits')}</h3><ul>${L(p.benefits).map((b) => `<li><span class="ok">${icon('check')}</span><span>${esc(b)}</span></li>`).join('')}</ul></div>
            <div class="pd-cta">
              <button class="btn primary block" data-lead="${p.slug}" data-kind="${demoFirst ? 'demo' : 'info'}">${demoFirst ? t('demo') : t('cta_full')}</button>
              <div class="row2">
                <button class="btn ghost ${inList(p.slug) ? 'on' : ''}" data-save="${p.slug}" aria-pressed="${inList(p.slug)}">${icon('bookmark', 'sm')} ${t('add_list')}</button>
                ${CFG.contact.whatsapp ? `<a class="btn wa" href="${waLink(p)}" target="_blank" rel="noopener">${icon('wa', 'sm')} WhatsApp</a>` : ''}
              </div>
            </div>
            <div class="no-price">${icon('info', 'sm')}<span>${t('no_price')}</span></div>
          </div>
        </div>
        ${p.video ? `<div class="video-box reveal"><h2>${t('video')}</h2><div class="video-frame">${videoEmbed(p.video, pName(p))}</div></div>` : ''}
        <div class="related" style="margin-top:56px"><h2>${t('related')}</h2><div class="grid-p">${rel.map(card).join('')}</div></div>
      </div>`;
  }
  const notFound = () => `<div class="wrap" style="padding:100px 0;text-align:center"><h1>404</h1><p style="margin:12px 0 24px;color:var(--muted)">—</p><a class="btn primary" href="#/">MQ Store</a></div>`;

  function videoEmbed(url, title) {
    const yt = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    if (yt) return `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0" title="${esc(title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    return `<video src="${esc(url)}" controls preload="metadata" playsinline></video>`;
  }
  function waLink(p) {
    const n = String(CFG.contact.whatsapp || '').replace(/\D/g, '');
    const msg = p ? (lang === 'en' ? `Hi, I’m interested in ${pName(p)}.` : `Hola, me interesa ${pName(p)}.`) : (lang === 'en' ? 'Hi, I’d like more information.' : 'Hola, quisiera más información.');
    return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
  }

  /* ---------- Reseñas (solo las aprobadas en el CRM) ---------- */
  let reviews = null;
  function reviewsHTML() {
    if (reviews && reviews.length) {
      return `<div class="reviews">${reviews.map((r) => `
        <figure class="review reveal" style="margin:0">
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
    if (!fb) fb = (async () => {
      const app = await import(SDK + 'firebase-app.js');
      const fs = await import(SDK + 'firebase-firestore.js');
      const a = app.getApps().find((x) => x.name === 'mqstore') || app.initializeApp(CFG.firebase, 'mqstore');
      return { db: fs.getFirestore(a), fs };
    })();
    fb.catch(() => { fb = null; });
    return fb;
  }
  // Envía una solicitud al CRM. Solo campos permitidos por las reglas de Firestore.
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
    document.body.style.overflow = 'hidden';
    const close = () => { w.hidden = true; w.innerHTML = ''; document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    w.onclick = (e) => { if (e.target === w || e.target.closest('[data-close]')) close(); };
    if (onOpen) onOpen(w.querySelector('.modal'), close);
    setTimeout(() => { const f = w.querySelector('input:not([type=hidden]):not(.hp input), textarea'); if (f && window.innerWidth > 640) f.focus(); }, 60);
    return close;
  }
  const head = (title, sub) => `<div class="modal-head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="modal-x" data-close aria-label="Cerrar">${icon('x')}</button></div>`;
  const doneHTML = (title, text) => `<div class="done"><span class="ok">${icon('check')}</span><h3>${title}</h3><p>${text}</p><button class="btn primary" data-close style="margin-top:8px">${t('f_close')}</button></div>`;
  const validPhone = (v) => { const d = String(v || '').replace(/\D/g, ''); return d.length === 10 || (d.length === 11 && d[0] === '1'); };
  const fieldsHTML = () => `
    <label class="field">${t('f_name')}<input name="name" autocomplete="name" required maxlength="80"></label>
    <div class="two">
      <label class="field">${t('f_phone')}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="20" placeholder="(407) 555-0123"></label>
      <label class="field">${t('f_email')} <span class="opt">${t('f_opt')}</span><input name="email" type="email" autocomplete="email" maxlength="120"></label>
    </div>`;
  const hp = '<div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>';

  // Solicitar información / demostración (uno o varios productos)
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
        if (d.website) return; // robot
        if (!d.name.trim() || !validPhone(d.phone)) { f.phone.classList.toggle('bad', !validPhone(d.phone)); return toast(t('f_req'), true); }
        if (!f.consent.checked) return toast(t('f_req_c'), true);
        const sl = chosen.length ? chosen.map((p) => p.slug) : (d.product ? [d.product] : []);
        await submit(f, () => sendLead({
          type: d.interest === 'demo' ? 'demo' : 'info', interest: d.interest, name: d.name.trim(), phone: d.phone.trim(), email: d.email.trim(), city: d.city.trim(),
          bestTime: d.bestTime, message: d.message.trim(), products: sl, productNames: sl.map((s) => prodBySlug(s).name), consent: true
        }), m, t('f_ok_t'), t('f_ok_p'));
        if (chosen.length && chosen.length === list.length) { list = []; store.set('mq_list', list); paintList(); }
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
      if (inline) { box.innerHTML = doneHTML(okT, okP).replace('data-close', 'data-reset'); const r = box.querySelector('[data-reset]'); if (r) r.remove(); }
      else box.innerHTML = doneHTML(okT, okP);
    } catch (e) {
      console.error(e);
      toast(t('f_err'), true);
      btn.disabled = false; btn.textContent = label;
    }
  }

  function openList() {
    const d = $('#drawer');
    const paint = () => {
      const items = list.map(prodBySlug).filter(Boolean);
      d.innerHTML = `<div class="drawer-in" role="dialog" aria-modal="true" aria-label="${t('list_t')}">
        <div class="drawer-head"><h2>${t('list_t')}</h2><button class="modal-x" data-dclose aria-label="Cerrar">${icon('x')}</button></div>
        <div class="drawer-body">${items.length ? items.map((p) => `<div class="li"><a class="thumb" href="#/p/${p.slug}" data-dclose>${media(p)}</a><div><strong>${esc(pName(p))}</strong><small>${esc(L(p.subtitle))}</small></div><button class="li-x" data-rm="${p.slug}" aria-label="Quitar">${icon('x', 'sm')}</button></div>`).join('') : `<div class="empty">${icon('bookmark', 'lg')}<p style="margin-top:10px">${t('list_empty')}</p></div>`}</div>
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

  /* ---------- Animación al hacer scroll ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -40px 0px' }) : null;
  function reveal(root = document) { $$('.reveal:not(.in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('in'))); }

  /* ---------- Navegación ---------- */
  let pendingScroll = null;
  function route() {
    const h = location.hash.replace(/^#\/?/, '');
    const [kind, id] = h.split('/');
    const main = $('#main');
    if (kind === 'c') { main.innerHTML = categoryPage(id); document.title = `${L((catById(id) || {}).name) || 'MQ Store'} · MQ Store`; }
    else if (kind === 'p') { const p = prodBySlug(id); main.innerHTML = productPage(id); document.title = p ? `${pName(p)} · MQ Store` : 'MQ Store'; }
    else { main.innerHTML = home(); document.title = lang === 'en' ? 'MQ Store · Pure water, wellness and technology for your home' : 'MQ Store · Agua pura, bienestar y tecnología para tu hogar'; bindJobForm(); if (reviews === null) loadReviews(); }
    $('#nav').classList.remove('open');
    if (pendingScroll) { const el = document.getElementById(pendingScroll); pendingScroll = null; if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 30); }
    else window.scrollTo(0, 0);
    reveal(main);
  }
  function render() { nav(); footer(); route(); paintList(); }

  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      const id = go.dataset.go;
      const el = document.getElementById(id);
      if (el && !location.hash.replace(/^#\/?/, '')) { el.scrollIntoView({ behavior: 'smooth' }); $('#nav').classList.remove('open'); }
      else { pendingScroll = id; location.hash = '#/'; if (location.hash === '#/') route(); }
      return;
    }
    const lead = e.target.closest('[data-lead]');
    if (lead) { e.preventDefault(); openLead(lead.dataset.lead ? [lead.dataset.lead] : [], lead.dataset.kind); return; }
    const save = e.target.closest('[data-save]');
    if (save) { e.preventDefault(); toggleList(save.dataset.save); return; }
    if (e.target.closest('[data-review]')) { openReview(); return; }
    const pic = e.target.closest('[data-pic]');
    if (pic) { $('#mainPic').innerHTML = `<img src="${esc(pic.dataset.pic)}" alt="">`; $$('[data-pic]').forEach((b) => b.classList.toggle('on', b === pic)); }
  });
  $('#langBtn').onclick = () => { lang = lang === 'es' ? 'en' : 'es'; store.set('mq_lang', lang); const y = window.scrollY; render(); window.scrollTo(0, y); };
  $('#listBtn').onclick = openList;
  $('#ctaTop').onclick = () => openLead(list.slice());
  $('#menuBtn').onclick = () => { const n = $('#nav'); n.classList.toggle('open'); $('#menuBtn').setAttribute('aria-expanded', n.classList.contains('open')); };
  window.addEventListener('scroll', () => $('#top').classList.toggle('scrolled', window.scrollY > 8), { passive: true });
  window.addEventListener('hashchange', route);
  if (CFG.contact.whatsapp) document.body.insertAdjacentHTML('beforeend', `<a class="wa-float" href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a>`);
  render();
})();
