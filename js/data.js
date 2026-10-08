/* =========================================================
   Contenido del catálogo MQ Store
   ---------------------------------------------------------
   Aquí se editan categorías y productos (español / inglés).
   - image:   foto principal (archivo en img/productos/ o URL de Cloudinary).
              Si está vacía se muestra una imagen de marca provisional.
   - gallery: fotos adicionales.
   - video:   enlace de YouTube o de un archivo .mp4 (opcional).
   No se muestran precios: cada producto tiene el botón de solicitar
   información o demostración, que llega directo al CRM.
   ========================================================= */
window.MQ_DATA = {
  categories: [
    { id: 'agua', short: { es: 'Agua', en: 'Water' }, color: '#0ea5e9', icon: 'drop',
      name: { es: 'Agua pura y bienestar', en: 'Pure water & wellness' },
      tagline: { es: 'Agua más suave, purificada y adaptada a tu hogar.', en: 'Softer, purified water tailored to your home.' } },
    { id: 'limpieza', short: { es: 'Limpieza', en: 'Cleaning' }, color: '#0284c7', icon: 'sparkle',
      name: { es: 'Limpieza y cuidado del hogar', en: 'Home cleaning & care' },
      tagline: { es: 'Un hogar más limpio y fresco todos los días.', en: 'A cleaner, fresher home every day.' } },
    { id: 'cocina', short: { es: 'Cocina', en: 'Kitchen' }, color: '#64748b', icon: 'pot',
      name: { es: 'Cocina y estilo de vida', en: 'Kitchen & lifestyle' },
      tagline: { es: 'Productos pensados para disfrutar tu cocina.', en: 'Products designed to enjoy your kitchen.' } },
    { id: 'relajacion', short: { es: 'Relajación', en: 'Relaxation' }, color: '#1e40af', icon: 'chair', brand: 'Bodyfriend',
      name: { es: 'Relajación y bienestar personal', en: 'Relaxation & personal wellness' },
      tagline: { es: 'Sillones de masaje Bodyfriend para descansar en casa.', en: 'Bodyfriend massage chairs to unwind at home.' } },
    { id: 'exteriores', short: { es: 'Exteriores', en: 'Outdoors' }, color: '#0e7490', icon: 'leaf',
      name: { es: 'Tecnología para exteriores', en: 'Outdoor technology' },
      tagline: { es: 'Tecnología inteligente para el cuidado de tus espacios exteriores.', en: 'Smart technology to care for your outdoor spaces.' } },
    { id: 'energia', short: { es: 'Energía', en: 'Power' }, color: '#334155', icon: 'bolt',
      name: { es: 'Energía y respaldo eléctrico', en: 'Power & energy backup' },
      tagline: { es: 'Energía de respaldo para que tu hogar no se detenga.', en: 'Backup power so your home keeps going.' } }
  ],

  // "¿Qué necesitas?": accesos directos según la necesidad del cliente
  needs: [
    { icon: 'glass', color: '#0ea5e9', to: 'p/k10', title: { es: 'Agua purificada para beber', en: 'Purified drinking water' }, text: { es: 'Ósmosis inversa en tu cocina', en: 'Reverse osmosis in your kitchen' } },
    { icon: 'drop', color: '#0284c7', to: 'p/puronics-softener', title: { es: 'Agua dura y sarro', en: 'Hard water & scale' }, text: { es: 'Suavizador para todo el hogar', en: 'Whole-home softener' } },
    { icon: 'well', color: '#0369a1', to: 'p/puronics-agua-de-pozo', title: { es: 'Tengo agua de pozo', en: 'I have well water' }, text: { es: 'Tratamiento según tu agua', en: 'Treatment for your water' } },
    { icon: 'sparkle', color: '#0284c7', to: 'p/hyla', title: { es: 'Limpieza profunda', en: 'Deep cleaning' }, text: { es: 'Filtración con agua HYLA', en: 'HYLA water filtration' } },
    { icon: 'chair', color: '#1e40af', to: 'c/relajacion', title: { es: 'Relajarme en casa', en: 'Relax at home' }, text: { es: 'Sillones de masaje Bodyfriend', en: 'Bodyfriend massage chairs' } },
    { icon: 'bolt', color: '#334155', to: 'p/bluetti', title: { es: 'Respaldo ante apagones', en: 'Backup for outages' }, text: { es: 'Energía BLUETTI', en: 'BLUETTI power' } },
    { icon: 'leaf', color: '#0e7490', to: 'p/yarbo', title: { es: 'Cuidar mi jardín', en: 'Care for my yard' }, text: { es: 'Robot modular Yarbo', en: 'Yarbo modular robot' } },
    { icon: 'pot', color: '#64748b', to: 'p/lifetime', title: { es: 'Disfrutar mi cocina', en: 'Enjoy my kitchen' }, text: { es: 'Línea Lifetime', en: 'Lifetime line' } }
  ],

  products: [
    /* ---------- 1. Agua pura y bienestar ---------- */
    { slug: 'puronics-softener', cat: 'agua', brand: 'Puronics', name: 'Puronics Softener', featured: true,
      image: '', gallery: [], video: '',
      subtitle: { es: 'Suavizador de agua para todo el hogar', en: 'Whole-home water softener' },
      desc: {
        es: 'Disfruta de los beneficios de un agua más suave en cada rincón de tu hogar. Puronics ayuda a reducir la dureza del agua y la acumulación de sarro, contribuyendo al cuidado de tus tuberías, grifos y electrodomésticos.',
        en: 'Enjoy the benefits of softer water in every corner of your home. Puronics helps reduce water hardness and scale buildup, helping protect your pipes, faucets and appliances.' },
      benefits: {
        es: ['Reduce la dureza del agua.', 'Ayuda a prevenir depósitos de sarro.', 'Facilita las tareas de limpieza.', 'Contribuye al cuidado de los electrodomésticos.'],
        en: ['Reduces water hardness.', 'Helps prevent scale deposits.', 'Makes cleaning easier.', 'Helps protect your appliances.'] } },

    { slug: 'k10', cat: 'agua', brand: 'K10', name: 'K10 – Ósmosis inversa', nameEn: 'K10 – Reverse osmosis', featured: true,
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sistema de purificación de agua potable', en: 'Drinking water purification system' },
      desc: {
        es: 'Disfruta de agua purificada directamente desde tu cocina. El sistema K10 utiliza tecnología de ósmosis inversa para reducir diversos contaminantes y ofrecer agua de calidad para beber y preparar tus alimentos.',
        en: 'Enjoy purified water straight from your kitchen. The K10 system uses reverse osmosis technology to reduce a variety of contaminants and deliver quality water for drinking and cooking.' },
      benefits: {
        es: ['Filtración avanzada del agua.', 'Agua para beber y cocinar.', 'Comodidad directamente desde el grifo.', 'Menor dependencia del agua embotellada.'],
        en: ['Advanced water filtration.', 'Water for drinking and cooking.', 'Convenience right from the faucet.', 'Less reliance on bottled water.'] } },

    { slug: 'puronics-alkaline', cat: 'agua', brand: 'Puronics', name: 'Puronics Alkaline', featured: true,
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sistema de ósmosis inversa con agua alcalina', en: 'Reverse osmosis system with alkaline water' },
      desc: {
        es: 'Una solución que combina la purificación mediante ósmosis inversa con una etapa de alcalinización. Diseñada para disfrutar de agua purificada con un perfil mineral y pH ajustado desde la comodidad de tu hogar.',
        en: 'A solution that combines reverse osmosis purification with an alkalizing stage. Designed so you can enjoy purified water with an adjusted mineral profile and pH from the comfort of your home.' },
      benefits: {
        es: ['Purificación por ósmosis inversa.', 'Etapa de alcalinización.', 'Agua disponible para consumo diario.', 'Menor necesidad de comprar botellas de agua.'],
        en: ['Reverse osmosis purification.', 'Alkalizing stage.', 'Water ready for everyday use.', 'Less need to buy bottled water.'] } },

    { slug: 'puronics-agua-de-pozo', cat: 'agua', brand: 'Puronics', name: 'Puronics – Agua de pozo', nameEn: 'Puronics – Well water',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sistema de tratamiento de agua de pozo', en: 'Well water treatment system' },
      desc: {
        es: 'Cada hogar merece una solución adaptada a su agua. Puronics ofrece opciones de tratamiento para viviendas que utilizan agua de pozo, ayudando a reducir problemas relacionados con sedimentos, dureza, hierro y otras características del agua, según el sistema instalado.',
        en: 'Every home deserves a solution tailored to its water. Puronics offers treatment options for homes that use well water, helping reduce issues related to sediment, hardness, iron and other water characteristics, depending on the installed system.' },
      benefits: {
        es: ['Tratamiento personalizado.', 'Opciones para reducir sedimentos y minerales.', 'Ayuda a proteger las instalaciones del hogar.', 'Evaluación según las condiciones del agua.'],
        en: ['Personalized treatment.', 'Options to reduce sediment and minerals.', 'Helps protect your home’s plumbing.', 'Assessment based on your water conditions.'] } },

    /* ---------- 2. Limpieza y cuidado del hogar ---------- */
    { slug: 'hyla', cat: 'limpieza', brand: 'HYLA', name: 'HYLA', featured: true, cta: 'demo',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sistema de limpieza con filtración por agua', en: 'Water-filtration cleaning system' },
      desc: {
        es: 'HYLA es un innovador sistema de limpieza que utiliza agua como medio de filtración para capturar polvo, suciedad y partículas del ambiente, ayudando a mantener un hogar más limpio y fresco.',
        en: 'HYLA is an innovative cleaning system that uses water as its filtration medium to capture dust, dirt and airborne particles, helping keep your home cleaner and fresher.' },
      benefits: {
        es: ['Limpieza profunda de diferentes superficies.', 'Captura polvo y suciedad mediante filtración con agua.', 'Ayuda a mejorar la limpieza del ambiente interior.', 'Sistema multifuncional para el cuidado del hogar.', 'Tecnología diseñada para facilitar la limpieza diaria.'],
        en: ['Deep cleaning on different surfaces.', 'Captures dust and dirt with water filtration.', 'Helps improve indoor cleanliness.', 'Multifunctional home-care system.', 'Technology designed to make daily cleaning easier.'] } },

    /* ---------- 3. Cocina y estilo de vida ---------- */
    { slug: 'lifetime', cat: 'cocina', brand: 'Lifetime', name: 'Lifetime',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Para tu cocina y tu estilo de vida', en: 'For your kitchen and lifestyle' },
      desc: {
        es: 'La línea Lifetime reúne productos pensados para el uso diario en la cocina de toda la familia. Agenda una demostración y conoce cómo puede acompañarte en tu día a día.',
        en: 'The Lifetime line brings together products designed for everyday family cooking. Book a demonstration and see how it can fit into your daily routine.' },
      benefits: {
        es: ['Pensado para el uso diario.', 'Para toda la familia.', 'Demostración y asesoría personalizada.'],
        en: ['Designed for everyday use.', 'For the whole family.', 'Personalized demonstration and advice.'] } },

    /* ---------- 4. Relajación y bienestar personal (Bodyfriend) ---------- */
    { slug: 'bodyfriend-pharaon-neo', cat: 'relajacion', brand: 'Bodyfriend', name: 'Pharaon Neo', featured: true, cta: 'demo',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sillón de masaje Bodyfriend', en: 'Bodyfriend massage chair' },
      desc: {
        es: 'Sillón de masaje Bodyfriend Pharaon Neo, diseñado para ayudarte a descansar y relajarte desde la comodidad de tu hogar.',
        en: 'The Bodyfriend Pharaon Neo massage chair, designed to help you rest and relax from the comfort of your home.' },
      benefits: {
        es: ['Masaje para todo el cuerpo.', 'Programas de masaje automáticos.', 'Diseño ergonómico y elegante.', 'Pruébalo en una demostración.'],
        en: ['Full-body massage.', 'Automatic massage programs.', 'Ergonomic, elegant design.', 'Try it in a demonstration.'] } },

    { slug: 'bodyfriend-falcon-sv', cat: 'relajacion', brand: 'Bodyfriend', name: 'Falcon SV', cta: 'demo',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sillón de masaje Bodyfriend', en: 'Bodyfriend massage chair' },
      desc: {
        es: 'Sillón de masaje Bodyfriend Falcon SV para disfrutar momentos de relajación en casa.',
        en: 'The Bodyfriend Falcon SV massage chair to enjoy moments of relaxation at home.' },
      benefits: {
        es: ['Masaje para todo el cuerpo.', 'Programas de masaje automáticos.', 'Diseño ergonómico.', 'Pruébalo en una demostración.'],
        en: ['Full-body massage.', 'Automatic massage programs.', 'Ergonomic design.', 'Try it in a demonstration.'] } },

    { slug: 'bodyfriend-eliza', cat: 'relajacion', brand: 'Bodyfriend', name: 'Eliza', cta: 'demo',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sillón de masaje Bodyfriend', en: 'Bodyfriend massage chair' },
      desc: {
        es: 'Sillón de masaje Bodyfriend Eliza, con un diseño que se integra a tu hogar para que te relajes cuando lo necesites.',
        en: 'The Bodyfriend Eliza massage chair, with a design that fits your home so you can relax whenever you need it.' },
      benefits: {
        es: ['Masaje para todo el cuerpo.', 'Programas de masaje automáticos.', 'Diseño que combina con tu hogar.', 'Pruébalo en una demostración.'],
        en: ['Full-body massage.', 'Automatic massage programs.', 'A design that blends into your home.', 'Try it in a demonstration.'] } },

    { slug: 'bodyfriend-family', cat: 'relajacion', brand: 'Bodyfriend', name: 'Family', cta: 'demo',
      image: '', gallery: [], video: '',
      subtitle: { es: 'Sillón de masaje Bodyfriend', en: 'Bodyfriend massage chair' },
      desc: {
        es: 'Sillón de masaje Bodyfriend Family, pensado para que toda la familia disfrute del descanso en casa.',
        en: 'The Bodyfriend Family massage chair, designed so the whole family can enjoy relaxing at home.' },
      benefits: {
        es: ['Masaje para todo el cuerpo.', 'Programas de masaje automáticos.', 'Para toda la familia.', 'Pruébalo en una demostración.'],
        en: ['Full-body massage.', 'Automatic massage programs.', 'For the whole family.', 'Try it in a demonstration.'] } },

    /* ---------- 5. Tecnología para exteriores ---------- */
    { slug: 'yarbo', cat: 'exteriores', brand: 'Yarbo', name: 'Yarbo', featured: true,
      image: '', gallery: [], video: '',
      subtitle: { es: 'Robot modular para exteriores', en: 'Modular outdoor robot' },
      desc: {
        es: 'Yarbo es un robot modular que te ayuda con el cuidado de tus espacios exteriores, combinando una base inteligente con diferentes módulos según la tarea.',
        en: 'Yarbo is a modular robot that helps you care for your outdoor spaces, combining a smart base with different modules depending on the task.' },
      benefits: {
        es: ['Plataforma modular con accesorios.', 'Ayuda con las tareas del exterior.', 'Funcionamiento autónomo e inteligente.', 'Demostración y asesoría personalizada.'],
        en: ['Modular platform with attachments.', 'Helps with outdoor chores.', 'Smart, autonomous operation.', 'Personalized demonstration and advice.'] } },

    /* ---------- 6. Energía y respaldo eléctrico ---------- */
    { slug: 'bluetti', cat: 'energia', brand: 'BLUETTI', name: 'BLUETTI', featured: true,
      image: '', gallery: [], video: '',
      subtitle: { es: 'Estaciones de energía y respaldo eléctrico', en: 'Power stations & backup power' },
      desc: {
        es: 'Soluciones de energía BLUETTI para tener respaldo eléctrico en tu hogar: estaciones de energía que almacenan electricidad para cuando más la necesitas.',
        en: 'BLUETTI power solutions for home backup: power stations that store electricity for when you need it most.' },
      benefits: {
        es: ['Respaldo eléctrico ante apagones.', 'Compatible con paneles solares.', 'Funcionamiento silencioso, sin combustible.', 'Opciones portátiles y para el hogar.'],
        en: ['Backup power during outages.', 'Solar panel compatible.', 'Quiet operation, no fuel.', 'Portable and home options.'] } }
  ]
};
