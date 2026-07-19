import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  // Estado unificado adaptado EXACTAMENTE a las columnas de tu ERD
  const [formData, setFormData] = useState({
    codigo_estudiante: '',
    numero_documento: '',
    estrato: '',
    nombres: '',
    apellidos: '',
    carrera: '',
    facultad: '',
    edad: '',
    sexo_biologico: 'Femenino', // Por defecto basándonos en la prueba de Mariana
    peso_kg: '',
    talla_cm: '',
    actividad_fisica: 'moderado',
    preferencia_dietaria: 'Ninguna',
    notas_practicante: '',
    // Estados temporales de la UI para los checkboxes
    diabetes: false,
    hipertension: false,
    gastritis: false,
    alergia_gluten: false,
    alergia_lactosa: false
  });

  const [loading, setLoading] = useState(false);

  // Manejador universal de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // EFECTO AUTOMÁTICO: Escucha el código del estudiante para auto-rellenar datos históricos
  useEffect(() => {
    const consultarSupabase = async () => {
      const codigoLimpio = formData.codigo_estudiante.trim();
      if (!codigoLimpio || codigoLimpio.length < 4) return;

      try {
        // Tu tabla estudiantes usa 'codigo_estudiantil' como PK según tu esquema
        const { data, error } = await supabase
          .from('estudiantes')
          .select('*')
          .eq('codigo_estudiantil', codigoLimpio)
          .maybeSingle();

        if (error) {
          console.error("❌ Error en Supabase:", error.message);
          return;
        }

        if (data) {
          setFormData((prev) => ({
            ...prev,
            numero_documento: data.numero_documento || '',
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            carrera: data.carrera || '',
            facultad: data.facultad || '',
            estrato: data.estrato || ''
          }));
        }
      } catch (err) {
        console.error("❌ Fallo crítico de petición:", err);
      }
    };

    consultarSupabase();
  }, [formData.codigo_estudiante]);

  // Cálculo en tiempo real del IMC
  const calcularIMC = () => {
    const p = parseFloat(formData.peso_kg);
    const t = parseFloat(formData.talla_cm) / 100; // cm a metros
    if (p > 0 && t > 0) {
      return (p / (t * t)).toFixed(1);
    }
    return 0;
  };

  const imc = calcularIMC();

  // Clasificación preliminar basada en Minsalud (Resolución 2465) para adultos de referencia
  const clasificarMinSalud = (valorImc) => {
    const v = parseFloat(valorImc);
    if (v <= 0) return 'Requiere datos';
    if (v < 18.5) return 'Delgadez';
    if (v >= 18.5 && v < 25) return 'Eutrófico (Peso adecuado)';
    if (v >= 25 && v < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  const clasificacion = clasificarMinSalud(imc);

  // ENVÍO DE DATOS: Mapeado idéntico a las columnas de tu tabla 'valoraciones_nutricionales'
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Construir los arreglos de texto (_text) dinámicamente según la UI
    const listaPatologias = [];
    if (formData.diabetes) listaPatologias.push('Diabetes');
    if (formData.hipertension) listaPatologias.push('Hipertensión');
    if (formData.gastritis) listaPatologias.push('Gastritis');

    const listaAlergias = [];
    if (formData.alergia_gluten) listaAlergias.push('Gluten');
    if (formData.alergia_lactosa) listaAlergias.push('Lactosa');

    try {
      const { error } = await supabase
        .from('valoraciones_nutricionales')
        .insert([
          {
            codigo_estudiante: formData.codigo_estudiante.trim(),
            edad: parseInt(formData.edad) || null,
            sexo_biologico: formData.sexo_biologico,
            peso_kg: parseFloat(formData.peso_kg) || null,
            talla_cm: parseFloat(formData.talla_cm) || null,
            imc: parseFloat(imc) || null,
            clasificacion_minsalud: clasificacion,
            actividad_ica: formData.actividad_fisica, // Vinculado a actividad_fisica del formulario
            patologias: listaPatologias, // Pasa como arreglo de postgres [_text]
            alergias: listaAlergias,     // Pasa como arreglo de postgres [_text]
            preferencia_dietaria: formData.preferencia_dietaria,
            notas_practicante: formData.notas_practicante || null
            // Los campos diagnostico_ia y tratamiento_ia se quedan fuera para que los procese tu backend/edge function después
          }
        ]);

      if (error) throw error;

      alert("✅ ¡Valoración guardada con éxito en la base de datos!");
      
      // Limpiar solo los inputs métricos y clínicos
      setFormData(prev => ({
        ...prev,
        edad: '',
        peso_kg: '',
        talla_cm: '',
        notas_practicante: '',
        diabetes: false,
        hipertension: false,
        gastritis: false,
        alergia_gluten: false,
        alergia_lactosa: false
      }));

    } catch (err) {
      console.error("❌ Error al insertar:", err.message);
      alert("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] p-6 flex items-center justify-center font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-[#eaddcd] overflow-hidden">
        
        {/* Encabezado */}
        <div className="bg-[#135838] p-8 text-center md:text-left border-b-4 border-[#cda851]">
          <h1 className="text-3xl font-bold text-white tracking-wide">Registro y Caracterización Nutricional</h1>
          <p className="text-sm text-gray-200 mt-1 font-medium">Sistema de Apoyo Alimentario — Universidad de Antioquia</p>
        </div>

        <form className="p-8 space-y-8" onSubmit={handleSubmit}>
          
          {/* SECCIÓN 1: Datos Básicos */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#135838] mb-3 border-b border-gray-100 pb-1">
              Información Académica y Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Código Estudiantil</label>
                <input
                  type="text"
                  name="codigo_estudiante"
                  required
                  value={formData.codigo_estudiante}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Documento de Identidad</label>
                <input
                  type="text"
                  name="numero_documento"
                  readOnly
                  value={formData.numero_documento}
                  className="w-full rounded-xl border border-gray-100 p-3 bg-gray-100/70 text-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Estrato Socioeconómico</label>
                <input
                  type="text"
                  name="estrato"
                  readOnly
                  value={formData.estrato}
                  className="w-full rounded-xl border border-gray-100 p-3 bg-gray-100/70 text-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombres Completos</label>
                <input
                  type="text"
                  name="nombres"
                  readOnly
                  value={formData.nombres}
                  className="w-full rounded-xl border border-gray-100 p-3 bg-gray-100/70 text-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos Completos</label>
                <input
                  type="text"
                  name="apellidos"
                  readOnly
                  value={formData.apellidos}
                  className="w-full rounded-xl border border-gray-100 p-3 bg-gray-100/70 text-gray-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Carrera / Programa Académico</label>
                <input
                  type="text"
                  name="carrera"
                  readOnly
                  value={formData.carrera}
                  className="w-full rounded-xl border border-gray-100 p-3 bg-gray-100/70 text-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Facultad</label>
                <input
                  type="text"
                  name="facultad"
                  readOnly
                  value={formData.facultad}
                  className="w-full rounded-xl border border-gray-100 p-3 bg-gray-100/70 text-gray-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Antropometría y Métricas */}
          <div className="bg-[#f4fbf7] p-6 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 border border-[#d2edcd]">
            <div>
              <label className="block text-xs font-bold text-[#135838] mb-1">Edad</label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 p-3 bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#135838] mb-1">Sexo Biológico</label>
              <select
                name="sexo_biologico"
                value={formData.sexo_biologico}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 p-3 bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#135838] mb-1">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                name="peso_kg"
                value={formData.peso_kg}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 p-3 bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#135838] mb-1">Estatura (cm)</label>
              <input
                type="number"
                name="talla_cm"
                value={formData.talla_cm}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 p-3 bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none"
              />
            </div>

            {/* Bloque de visualización IMC / Minsalud */}
            <div className="border-2 border-[#cda851] rounded-xl bg-white p-2 flex flex-col items-center justify-center shadow-sm text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">IMC: {imc}</span>
              <span className="text-xs font-black text-gray-800 my-0.5 leading-tight">{clasificacion}</span>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 ${imc > 0 ? 'bg-[#135838] text-white' : 'bg-gray-100 text-gray-500'}`}>
                {imc > 0 ? 'RESOLUCIÓN 2465' : 'ESPERANDO'}
              </span>
            </div>
          </div>

          {/* SECCIÓN 3: Variables Clínicas y de Estilo de Vida */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#135838] mb-4 border-b border-gray-100 pb-1">
              Variables Clínicas y de Estilo de Vida
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Nivel de Actividad Física</label>
                <select
                  name="actividad_fisica"
                  value={formData.actividad_fisica}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none transition-all"
                >
                  <option value="sedentario">Sedentario / Poco ejercicio</option>
                  <option value="moderado">Moderado / Ejercicio regular</option>
                  <option value="activo">Activo / Ejercicio diario</option>
                  <option value="alto_rendimiento">Deportista de Alto Rendimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Preferencia Dietaria</label>
                <select
                  name="preferencia_dietaria"
                  value={formData.preferencia_dietaria}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none transition-all"
                >
                  <option value="Ninguna">Ninguna / Omnívoro</option>
                  <option value="Vegetariano">Vegetariano</option>
                  <option value="Vegano">Vegano</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Patologías Diagnosticadas</label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200/60 hover:bg-gray-100 transition-all">
                    <input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleChange} className="rounded text-[#135838] focus:ring-[#135838]" />
                    <span>Diabetes</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200/60 hover:bg-gray-100 transition-all">
                    <input type="checkbox" name="hipertension" checked={formData.hipertension} onChange={handleChange} className="rounded text-[#135838] focus:ring-[#135838]" />
                    <span>Hipertensión</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200/60 hover:bg-gray-100 transition-all">
                    <input type="checkbox" name="gastritis" checked={formData.gastritis} onChange={handleChange} className="rounded text-[#135838] focus:ring-[#135838]" />
                    <span>Gastritis</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Alergias o Intolerancias</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200/60 hover:bg-gray-100 transition-all">
                    <input type="checkbox" name="alergia_gluten" checked={formData.alergia_gluten} onChange={handleChange} className="rounded text-[#135838] focus:ring-[#135838]" />
                    <span>Gluten</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200/60 hover:bg-gray-100 transition-all">
                    <input type="checkbox" name="alergia_lactosa" checked={formData.alergia_lactosa} onChange={handleChange} className="rounded text-[#135838] focus:ring-[#135838]" />
                    <span>Lactosa</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Campo Notas del Practicante */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Notas del Practicante / Observaciones</label>
              <textarea
                name="notes_practicante" // Mapeado a la propiedad de estado
                value={formData.notas_practicante}
                onChange={(e) => setFormData(p => ({ ...p, notas_practicante: e.target.value }))}
                rows="3"
                placeholder="Escribe anotaciones clínicas adicionales aquí..."
                className="w-full rounded-xl border border-gray-200 p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#135838] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Botón */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#135838] hover:bg-[#0f442b] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Guardando en Base de Datos...' : 'Guardar Valoración Clínica'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}