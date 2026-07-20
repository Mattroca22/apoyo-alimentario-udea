import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function HistorialAsistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    setLoading(true);
    // Hacemos un join con la tabla 'estudiantes' para traer el nombre
    const { data, error } = await supabase
      .from('asistencias')
      .select('*, estudiantes(nombres, apellidos)')
      .order('fecha_hora', { ascending: false });

    if (error) {
      console.error("Error al cargar historial:", error);
    } else {
      setAsistencias(data);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#135838] mb-6">Historial de Entregas</h2>
      
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b">Código</th>
                <th className="p-3 border-b">Estudiante</th>
                <th className="p-3 border-b">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3">{item.codigo_estudiante}</td>
                  <td className="p-3">
                    {item.estudiantes 
                      ? `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` 
                      : 'Estudiante no registrado'}
                  </td>
                  <td className="p-3">
                    {new Date(item.fecha_hora).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}