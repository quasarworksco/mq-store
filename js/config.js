/* =========================================================
   Configuración de MQ Store
   ---------------------------------------------------------
   - firebase: la misma base de datos del CRM. Es pública por diseño:
     las reglas de Firestore solo dejan a la tienda CREAR solicitudes
     (colección webLeads) y LEER las reseñas aprobadas (reviews).
   - contacto: lo que se muestra en la tienda.
   ========================================================= */
window.MQ_CONFIG = {
  firebase: {
    apiKey: 'AIzaSyDomnn6WZU799SWznGt1ZN7NFl3c39DEmU',
    authDomain: 'crm-maria-8f7af.firebaseapp.com',
    projectId: 'crm-maria-8f7af',
    storageBucket: 'crm-maria-8f7af.firebasestorage.app',
    messagingSenderId: '334570619622',
    appId: '1:334570619622:web:d40596e789d85a672f3127'
  },
  contact: {
    phone: '+13214967088',          // llamadas: suenan en el CRM
    whatsapp: '',                   // número con WhatsApp, formato 13215551234 (vacío = no se muestra)
    email: '',
    location: 'The Florida Mall',
    address: '8001 S Orange Blossom Trail, Orlando, FL 32809',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Florida+Mall+Orlando+FL',
    instagram: '',
    facebook: '',
    heroImage: ''                   // foto de portada (se cambia desde el CRM)
  },
  crmUrl: 'https://crmsystempb.dgp-link.com'
};
