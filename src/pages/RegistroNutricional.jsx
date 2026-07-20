import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegistroNutricional from './RegistroNutricional'; // Mueve tu código actual aquí
import RegistroEntregas from './RegistroEntregas'; // Este lo crearemos



export default function App() {
  const [formData, setFormData] = useState({
    codigo_estudiante: '',
    numero_documento: '',
    estrato: '',
    nombres: '',
    apellidos: '',
    carrera: '',
    facultad: '',
    edad: '',
    sexo_biologico: 'Femenino',
    peso_kg: '',
    talla_cm: '',
    actividad_fisica: 'moderado',
    preferencia_dietaria: 'Ninguna',
    notas_practicante: '',
    diabetes: false,
    hipertension: false,
    gastritis: false,
    alergia_gluten: false,
    alergia_lactosa: false
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    const consultarSupabase = async () => {
      const codigoLimpio = formData.codigo_estudiante.trim();
      if (!codigoLimpio || codigoLimpio.length < 4) return;

      try {
        const { data, error } = await supabase
          .from('estudiantes')
          .select('*')
          .eq('codigo_estudiantil', codigoLimpio)
          .maybeSingle();

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
        console.error("Error consultando estudiante:", err);
      }
    };
    consultarSupabase();
  }, [formData.codigo_estudiante]);

  const imc = (parseFloat(formData.peso_kg) / Math.pow(parseFloat(formData.talla_cm) / 100, 2) || 0).toFixed(1);
  const clasificacion = imc <= 0 ? 'Requiere datos' : imc < 18.5 ? 'Delgadez' : imc < 25 ? 'Eutrófico' : imc < 30 ? 'Sobrepeso' : 'Obesidad';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const listaPatologias = [];
    if (formData.diabetes) listaPatologias.push('Diabetes');
    if (formData.hipertension) listaPatologias.push('Hipertensión');
    if (formData.gastritis) listaPatologias.push('Gastritis');

    const listaAlergias = [];
    if (formData.alergia_gluten) listaAlergias.push('Gluten');
    if (formData.alergia_lactosa) listaAlergias.push('Lactosa');

    try {
      // Si quieres guardar nombres, apellidos, etc., asegúrate de que existan como columnas en Supabase.
      // Por ahora solo guardamos los campos que sabemos que existen en 'valoraciones_nutricionales'.
      const { error } = await supabase
        .from('valoraciones_nutricionales')
        .insert([{
          codigo_estudiante: formData.codigo_estudiante.trim(),
          edad: parseInt(formData.edad) || null,
          sexo_biologico: formData.sexo_biologico,
          peso_kg: parseFloat(formData.peso_kg) || null,
          talla_cm: parseFloat(formData.talla_cm) || null,
          imc: parseFloat(imc) || null,
          clasificacion_minsalud: clasificacion,
          actividad_fisica: formData.actividad_fisica,
          patologias: listaPatologias,
          alergias: listaAlergias,
          preferencia_dietaria: formData.preferencia_dietaria,
          notas_practicante: formData.notas_practicante || null
        }]);

      if (error) throw error;
      alert("✅ ¡Valoración guardada correctamente!");
    } catch (err) {
      alert("Error al guardar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-[#eaddcd]">
        <div className="bg-[#135838] p-8 text-white rounded-t-2xl border-b-4 border-[#cda851]">
          <h1 className="text-3xl font-bold">Registro y Caracterización Nutricional</h1>
          <p className="text-sm opacity-90 mt-1">Sistema de Apoyo Alimentario — Universidad de Antioquia</p>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#135838] mb-4 border-b pb-2">Información Académica y Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Código Estudiantil</label><input type="text" name="codigo_estudiante" value={formData.codigo_estudiante} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-[#135838] outline-none" /></div>
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Documento de Identidad</label><input type="text" name="numero_documento" value={formData.numero_documento} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2" /></div>
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Estrato Socioeconómico</label><input type="text" name="estrato" value={formData.estrato} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nombres Completos</label><input type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2" /></div>
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos Completos</label><input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Carrera / Programa Académico</label><input type="text" name="carrera" value={formData.carrera} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2" /></div>
             <div><label className="block text-xs font-semibold text-gray-600 mb-1">Facultad</label><input type="text" name="facultad" value={formData.facultad} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2" /></div>
          </div>

          <div className="bg-[#f0f9f4] p-4 rounded-xl border border-[#c3e6cb] grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
             <div><label className="block text-xs font-bold text-[#135838]">Edad</label><input type="number" name="edad" value={formData.edad} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#135838] outline-none" /></div>
             <div><label className="block text-xs font-bold text-[#135838]">Peso (kg)</label><input type="number" step="0.1" name="peso_kg" value={formData.peso_kg} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#135838] outline-none" /></div>
             <div><label className="block text-xs font-bold text-[#135838]">Estatura (cm)</label><input type="number" name="talla_cm" value={formData.talla_cm} onChange={handleChange} className="w-full bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#135838] outline-none" /></div>
             <div className="text-center bg-white border-2 border-[#cda851] rounded-lg p-2">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">IMC CALCULADO</label>
                <div className="text-2xl font-bold text-[#135838]">{imc}</div>
                <div className="text-[10px] font-bold text-[#135838] uppercase bg-[#f0eadd] py-1 rounded">{clasificacion}</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-xs font-bold text-gray-600 mb-2">Actividad Física</label><select name="actividad_fisica" value={formData.actividad_fisica} onChange={handleChange} className="w-full border p-2 rounded-lg"><option value="sedentario">Sedentario</option><option value="moderado">Moderado</option><option value="activo">Activo</option></select></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-2">Preferencia Dietaria</label><select name="preferencia_dietaria" value={formData.preferencia_dietaria} onChange={handleChange} className="w-full border p-2 rounded-lg"><option value="Ninguna">Ninguna</option><option value="Vegetariano">Vegetariano</option><option value="Vegano">Vegano</option></select></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-xs font-bold text-gray-600 mb-2">Patologías</label>
               <div className="flex flex-wrap gap-4"><label className="flex items-center text-xs"><input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleChange} className="mr-2"/>Diabetes</label><label className="flex items-center text-xs"><input type="checkbox" name="hipertension" checked={formData.hipertension} onChange={handleChange} className="mr-2"/>HTA</label><label className="flex items-center text-xs"><input type="checkbox" name="gastritis" checked={formData.gastritis} onChange={handleChange} className="mr-2"/>Gastritis</label></div>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-2">Alergias</label>
               <div className="flex flex-wrap gap-4"><label className="flex items-center text-xs"><input type="checkbox" name="alergia_gluten" checked={formData.alergia_gluten} onChange={handleChange} className="mr-2"/>Gluten</label><label className="flex items-center text-xs"><input type="checkbox" name="alergia_lactosa" checked={formData.alergia_lactosa} onChange={handleChange} className="mr-2"/>Lactosa</label></div>
            </div>
          </div>

          <textarea name="notas_practicante" value={formData.notas_practicante} onChange={handleChange} placeholder="Notas del practicante..." rows="3" className="w-full border p-3 rounded-lg"></textarea>
          
          <button type="submit" disabled={loading} className="w-full bg-[#135838] text-white py-3 rounded-lg font-bold hover:bg-[#0f442b] transition-colors">
            {loading ? 'Guardando...' : 'Guardar Valoración Clínica'}
          </button>
        </form>
      </div>
    </div>
  );
}