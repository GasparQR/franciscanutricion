// products.js · Catálogo estático de Ebooks
// Para agregar, editar o dar de baja un Ebook, modificá este archivo y hacé deploy.
// No hace falta base de datos ni backend.
//
// IMPORTANTE: después de tocar este archivo, correr `npm run jsonld`.
// Los datos estructurados que leen Meta y Google se generan desde acá, y si no
// se regeneran quedan con los precios viejos.

const PRODUCTS = [
  {
    id: 'compras-inteligentes',
    title: 'Compras Inteligentes',
    description: 'Una guía práctica para aprender a elegir mejor en el súper y la dietética. Aprendé a leer etiquetas, interpretar listas de ingredientes y entender la información nutricional para tomar decisiones con más herramientas, sin dejarte llevar únicamente por lo que el envase dice que es “saludable”.',
    price: 0,
    free: true,
    pdf_url: '/assets/ebooks/compras-inteligentes.pdf',
    cover_image: '/assets/covers/compras-inteligentes.jpg',
  },
  {
    id: 'combo-organizacion-semana',
    title: 'Combo: Organización que te Resuelve la Semana',
    subtitle: 'Planner semanal + Guía de desayunos y meriendas',
    description: 'Planificá tus comidas, tené ideas concretas a mano y olvidate de pensar todos los días qué vas a comer. Y así, un problema menos :)',
    price: 38000,
    original_price: 49000,
    featured: true,
    cover_image: '/assets/covers/combo-organizacion.jpg',
  },
  {
    id: 'planner-semanal',
    title: 'Planner Semanal',
    description: 'La forma simple de tener tus comidas encaminadas. Si tenés un domingo libre, usalo para descansar, salir, dormir una siesta o hacer eso que durante la semana nunca tenés tiempo de hacer. En este planner te muestro otra forma de organizar tus comidas y resolver la semana sin vivir en la cocina.',
    price: 26000,
    original_price: 34000,
    cover_image: '/assets/covers/planner-semanal.jpg',
  },
  {
    id: 'guia-desayunos-meriendas',
    title: 'Guía de Desayunos y Meriendas',
    description: 'Si sos de los que "siempre terminan comiendo lo mismo" o ya no sabés qué desayunar o merendar… esta guía es para vos. Ideas fáciles, ricas y completas para variar tus desayunos y meriendas sin tener que pensar todos los días qué preparar.',
    price: 15000,
    original_price: 20000,
    cover_image: '/assets/covers/desayunos-meriendas.jpg',
  },
  {
    id: 'recetario',
    title: 'Recetario',
    description: 'Si te gustan las recetas fáciles, simples y no querés complicarte la vida cocinando… este recetario es para vos. Recetas para hacer a ojo, sin una lista eterna de ingredientes ni pasos imposibles, usando cosas que probablemente ya tenés en casa.',
    price: 12000,
    original_price: 16000,
    cover_image: '/assets/covers/recetario.jpg',
  },
];
