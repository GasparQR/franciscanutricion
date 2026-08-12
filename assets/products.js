// products.js · Catálogo estático de Ebooks
// Para agregar, editar o dar de baja un Ebook, modificá este archivo y hacé deploy.
// No hace falta base de datos ni backend.

const PRODUCTS = [
  {
    id: 'guia-desayunos-meriendas',
    title: 'Guía de Desayunos y Meriendas',
    description: 'Si sos de los que "siempre terminan comiendo lo mismo" o ya no sabés qué desayunar o merendar… esta guía es para vos. Ideas fáciles, ricas y completas para variar tus desayunos y meriendas sin tener que pensar todos los días qué preparar.',
    price: 15000,
    cover_image: '/assets/covers/desayunos-meriendas.jpg',
  },
  {
    id: 'recetario',
    title: 'Recetario',
    description: 'Si te gustan las recetas fáciles, simples y no querés complicarte la vida cocinando… este recetario es para vos. Recetas para hacer a ojo, sin una lista eterna de ingredientes ni pasos imposibles, usando cosas que probablemente ya tenés en casa.',
    price: 12000,
    cover_image: '/assets/covers/recetario.jpg',
  },
  {
    id: 'planner-semanal',
    title: 'Planner Semanal',
    description: 'La forma simple de tener tus comidas encaminadas. Si tenés un domingo libre, usalo para descansar, salir, dormir una siesta o hacer eso que durante la semana nunca tenés tiempo de hacer. En este planner te muestro otra forma de organizar tus comidas y resolver la semana sin vivir en la cocina.',
    price: 26000,
    cover_image: '/assets/covers/planner-semanal.jpg',
  },
  {
    id: 'combo-organizacion-semana',
    title: 'Combo: Organización que te Resuelve la Semana',
    subtitle: 'Planner semanal + Guía de desayunos y meriendas',
    description: 'Planificá tus comidas, tené ideas concretas a mano y olvidate de pensar todos los días qué vas a comer. Y así, un problema menos :)',
    price: 38000,
    cover_image: '/assets/covers/combo-organizacion.jpg',
  },
];
