export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const answers = req.body;
      
      return res.status(200).json({
        success: true,
        message: 'Respuestas guardadas correctamente',
        data: answers,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al guardar respuestas',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
