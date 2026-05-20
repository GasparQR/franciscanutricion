import React, { useState } from 'react';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 'profession',
      title: '¿Cuál es tu profesión exacta?',
      type: 'radio',
      options: [
        'Lic. en Nutrición',
        'Lic. Nutricionista',
        'Nutricionista con especialidad',
        'Nutrición & Entrenador Personal',
        'Otro'
      ]
    },
    {
      id: 'specialty',
      title: '¿Cuál es tu especialidad principal?',
      type: 'radio',
      options: [
        'Pérdida de peso',
        'Nutrición deportiva',
        'Nutrición holística/integrativa',
        'Nutrición clínica',
        'Trastornos alimentarios'
      ]
    },
    {
      id: 'brand_age',
      title: '¿Hace cuánto existe "Francisca Nutrición"?',
      type: 'radio',
      options: [
        'Menos de 6 meses',
        '6-12 meses',
        '1-2 años',
        '2-5 años',
        'Más de 5 años'
      ]
    },
    {
      id: 'client_age',
      title: '¿Qué edad tiene tu cliente ideal?',
      type: 'radio',
      options: [
        '18-25 años',
        '25-35 años',
        '35-45 años',
        '45-55 años',
        '55+ años'
      ]
    },
    {
      id: 'client_location',
      title: '¿Dónde están ubicados principalmente tus clientes?',
      type: 'radio',
      options: [
        'Online (100%)',
        'Consultorio físico (100%)',
        'Híbrido (online + consultorio)',
        'Varias provincias',
        'Internacional'
      ]
    },
    {
      id: 'main_pain',
      title: '¿Cuál es el principal "dolor" que resuelves?',
      type: 'radio',
      options: [
        'Bajar de peso sin privaciones',
        'Mejorar rendimiento deportivo',
        'Regulación emocional/trastornos alimentarios',
        'Salud integral/bienestar',
        'Otro problema específico'
      ]
    },
    {
      id: 'perception',
      title: '¿Cómo quieres ser percibida? (elige hasta 3)',
      type: 'checkbox',
      options: [
        'Profesional/Científica',
        'Cercana/Humana',
        'Premium/Exclusiva',
        'Innovadora',
        'Accesible',
        'Empática'
      ]
    },
    {
      id: 'differential',
      title: '¿Cuál es tu MAYOR diferencial vs otras nutricionistas?',
      type: 'radio',
      options: [
        'Mi metodología única',
        'Mi experiencia/certificaciones',
        'Cómo trato a mis clientes',
        'Mis resultados',
        'Mi especialidad específica'
      ]
    },
    {
      id: 'services',
      title: '¿Qué servicios ofreces? (elige los principales)',
      type: 'checkbox',
      options: [
        'Consultas online',
        'Consultorio presencial',
        'Programa/plan de nutrición',
        'Membresía/coaching continuo',
        'Cursos online',
        'E-books/contenido digital'
      ]
    },
    {
      id: 'price_range',
      title: '¿Cuál es tu rango de precios?',
      type: 'radio',
      options: [
        'Económica (accesible)',
        'Mid-market (precio medio)',
        'Premium (precio alto)',
        'Ultra-premium (precio muy alto)',
        'Varía según servicio'
      ]
    },
    {
      id: 'rebranding_goal',
      title: '¿Cuál es tu objetivo principal con esta rediseño?',
      type: 'radio',
      options: [
        'Modernizar la marca actual',
        'Cambiar completamente el posicionamiento',
        'Mejorar presencia digital',
        'Atraer clientes premium',
        'Todos los anteriores'
      ]
    },
    {
      id: 'values',
      title: '¿Cuáles son tus 3 valores de marca principales?',
      type: 'checkbox',
      options: [
        'Profesionalismo',
        'Autenticidad',
        'Innovación',
        'Empatía',
        'Excelencia',
        'Confianza',
        'Accesibilidad',
        'Transformación'
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    if (questions[currentStep].type === 'checkbox') {
      const current = answers[questionId] || [];
      if (current.includes(value)) {
        setAnswers({
          ...answers,
          [questionId]: current.filter(v => v !== value)
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...current, value]
        });
      }
    } else {
      setAnswers({
        ...answers,
        [questionId]: value
      });
    }
  };

  const canProceed = () => {
    const currentQuestion = questions[currentStep];
    return answers[currentQuestion.id] && 
           (Array.isArray(answers[currentQuestion.id]) 
            ? answers[currentQuestion.id].length > 0 
            : answers[currentQuestion.id]);
  };

  const handleNext = () => {
    if (canProceed() && currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (canProceed()) {
      setShowResults(true);
    }
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(answers, null, 2);
    navigator.clipboard.writeText(text);
  };

  const downloadJSON = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(answers, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'francisca-nutricion-responses.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-green-700 flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        .title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
        }
        
        body {
          background: linear-gradient(135deg, #2d6a4f 0%, #52b788 50%, #95d5b2 100%);
          min-height: 100vh;
        }

        .container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          width: 100%;
          padding: 50px 40px;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-container {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 40px;
          font-weight: bold;
        }

        .brand-name {
          font-size: 24px;
          font-weight: 700;
          color: #2d6a4f;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .brand-tagline {
          font-size: 14px;
          color: #52b788;
          font-weight: 500;
        }

        .progress-bar {
          height: 6px;
          background: #f0f0f0;
          border-radius: 10px;
          margin: 30px 0;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2d6a4f 0%, #52b788 100%);
          transition: width 0.3s ease;
          width: ${((currentStep + 1) / questions.length) * 100}%;
        }

        .step-counter {
          font-size: 12px;
          color: #999;
          margin-bottom: 20px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .question {
          font-size: 22px;
          font-weight: 700;
          color: #2d6a4f;
          margin-bottom: 30px;
          line-height: 1.3;
        }

        .options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
        }

        .option {
          position: relative;
          cursor: pointer;
        }

        .option input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .option label {
          display: block;
          padding: 14px 16px;
          background: #f8f8f8;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          color: #333;
        }

        .option input:checked + label {
          background: #e8f5e9;
          border-color: #52b788;
          color: #2d6a4f;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(82, 183, 136, 0.2);
        }

        .option:hover label {
          border-color: #52b788;
          background: #f5f5f5;
        }

        .buttons {
          display: flex;
          gap: 12px;
          margin-top: 40px;
        }

        button {
          flex: 1;
          padding: 12px 24px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(82, 183, 136, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: white;
          color: #2d6a4f;
          border: 2px solid #e0e0e0;
        }

        .btn-secondary:hover {
          border-color: #52b788;
          background: #f8f8f8;
        }

        .results-container {
          background: white;
          border-radius: 20px;
          padding: 50px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.5s ease-out;
        }

        .results-title {
          font-size: 28px;
          font-weight: 700;
          color: #2d6a4f;
          margin-bottom: 10px;
          text-align: center;
        }

        .results-subtitle {
          text-align: center;
          color: #999;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .results-content {
          background: #f8f8f8;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #333;
          white-space: pre-wrap;
          word-break: break-word;
          border-left: 4px solid #52b788;
        }

        .results-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .results-buttons button {
          flex: 1;
          min-width: 120px;
        }
      `}</style>

      <div className="w-full">
        {!showResults ? (
          <div className="container">
            <div className="logo-container">
              <div className="logo">🥑</div>
              <div className="brand-name">FRANCISCA NUTRICIÓN</div>
              <div className="brand-tagline">Descubrimiento de Marca</div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>

            <div className="step-counter">
              Pregunta {currentStep + 1} de {questions.length}
            </div>

            <div className="question">
              {questions[currentStep].title}
            </div>

            <div className="options">
              {questions[currentStep].options.map((option) => (
                <div key={option} className="option">
                  <input
                    type={questions[currentStep].type === 'checkbox' ? 'checkbox' : 'radio'}
                    name={questions[currentStep].id}
                    value={option}
                    checked={
                      questions[currentStep].type === 'checkbox'
                        ? (answers[questions[currentStep].id] || []).includes(option)
                        : answers[questions[currentStep].id] === option
                    }
                    onChange={() => handleAnswer(questions[currentStep].id, option)}
                    id={`${questions[currentStep].id}-${option}`}
                  />
                  <label htmlFor={`${questions[currentStep].id}-${option}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <div className="buttons">
              {currentStep > 0 && (
                <button className="btn-secondary" onClick={handlePrevious}>
                  Atrás
                </button>
              )}
              {currentStep < questions.length - 1 ? (
                <button
                  className="btn-primary"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleFinish}
                  disabled={!canProceed()}
                >
                  Finalizar
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="results-container">
            <div className="results-title">✅ ¡Respuestas Guardadas!</div>
            <div className="results-subtitle">
              Copia tus respuestas en JSON o descárgalas como archivo
            </div>

            <div className="results-content">
              {JSON.stringify(answers, null, 2)}
            </div>

            <div className="results-buttons">
              <button className="btn-primary" onClick={copyToClipboard}>
                📋 Copiar al Portapapeles
              </button>
              <button className="btn-primary" onClick={downloadJSON}>
                ⬇️ Descargar JSON
              </button>
              <button className="btn-secondary" onClick={() => {
                setCurrentStep(0);
                setAnswers({});
                setShowResults(false);
              }}>
                🔄 Nuevo Formulario
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
