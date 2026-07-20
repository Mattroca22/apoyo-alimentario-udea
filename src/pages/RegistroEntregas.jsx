import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RegistroEntregas() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistrarEntrega = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Obtener el día actual en español
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const hoy = diasSemana[new Date().getDay()];
      const hoyISO = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD para comparar fecha

      // 2. Consultar si el estudiante existe y traer sus días autorizados
      const { data: estudiante, error: errorEstudiante } = await supabase
        .from('estudiantes')
        .select('dias_beneficio, nombres, apellidos')
        .eq('codigo_estudiantil', codigo)
        .maybeSingle();

      if (errorEstudiante) throw new Error("Error al consultar la base de datos.");
      if (!estudiante) throw new Error("Estudiante no encontrado. Verifica el código.");

      // 3. Validar si hoy es un día autorizado
      if (!estudiante.dias_beneficio || !estudiante.dias_beneficio.includes(hoy)) {
        throw new Error(`⚠️ El estudiante no tiene beneficio para hoy (${hoy}). Días autorizados: ${estudiante.dias_beneficio ? estudiante.dias_beneficio.join(', ') : 'Ninguno'}`);
      }

      // 4. Validar si ya reclamó hoy
      const { data: asistenciaHoy, error: errorAsistencia } = await supabase
        .from('asistencias')
        .select('*')
        .eq('codigo_estudiante', codigo)
        .gte('fecha_hora', `${hoyISO}T00:00:00`); // Filtra registros de hoy

      if (errorAsistencia) throw new Error("Error al validar asistencias previas.");
      if (asistenciaHoy && asistenciaHoy.length > 0) {
        throw new Error("❌ Este estudiante ya registró su asistencia el día de hoy.");
      }

      // 5. Registrar la asistencia
      const { error: insertError } = await supabase
        .from('asistencias')
        .insert([{ codigo_estudiante: codigo }]);

      if (insertError) throw new Error("Error al insertar en la base de datos.");

      alert(`✅ ¡Registro exitoso! Bienvenido/a ${estudiante.nombres}`);
      setCodigo('');

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 flex justify-center">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-[#135838] mb-4">Registro de Asistencia</h2>
        <form onSubmit={handleRegistrarEntrega}>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Código Estudiantil</label>
          <input 
            type="text" 
            value={codigo} 
            onChange={(e) => setCodigo(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-[#135838] outline-none" 
            placeholder="Ej: 1035222" 
            required 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#135838] text-white py-2 rounded-lg font-bold hover:bg-[#0f442b] transition-colors"
          >
            {loading ? 'Validando...' : 'Confirmar Asistencia'}
          </button>
        </form>
      </div>
    </div>
  );
}