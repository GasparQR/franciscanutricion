// products.js · Catálogo estático de Ebooks
// Para agregar, editar o dar de baja un Ebook, modificá este archivo y hacé deploy.
// No hace falta base de datos ni backend.

const PRODUCTS = [
  {
    id: 'guia-meal-prep',
    title: 'Guía de Meal Prep',
    description: 'Organizá tus comidas de la semana en una sola tarde, con listas de compras y recetas base.',
    price: 8900,
    cover_image: '/assets/covers/meal-prep.jpg',
  },
  {
    id: 'recetas-reales',
    title: 'Recetas Reales',
    description: '50 recetas simples, ricas y nutritivas para el día a día, sin ingredientes raros.',
    price: 6900,
    cover_image: '/assets/covers/recetas.jpg',
  },
  {
    id: 'habitos-que-transforman',
    title: 'Hábitos que Transforman',
    description: 'Una guía práctica para construir hábitos saludables sostenibles y mejorar tu relación con la comida.',
    price: 7900,
    cover_image: '/assets/covers/habitos.jpg',
  },
];
