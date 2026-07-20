import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import AdminDashboard from '../components/AdminDashboard';
import * as XLSX from 'xlsx';
import EvolucionModal from '../components/EvolucionModal';

export default function HistorialAsistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    setLoading(true);
    // Consulta anidada incluyendo 'edad' para alimentar el histograma del dashboard
    const { data, error } = await supabase
      .from('asistencias')
      .select(`
        *, 
        estudiantes (
          nombres, 
          apellidos, 
          facultad,
          valoraciones_nutricionales (
            clasificacion_minsalud,
            edad
          )
        )
      `)
      .order('fecha_hora', { ascending: false });

    if (error) console.error("Error al traer datos:", error);
    else setAsistencias(data || []);
    setLoading(false);
  };

  // Helper para el semáforo nutricional
  const getStatusIndicator = (clasificacion) => {
    if (!clasificacion) return { emoji: '⚪', label: 'Sin datos', color: 'text-gray-400' };
    const c = clasificacion.toLowerCase();
    if (c.includes('normal') || c.includes('adecuado')) return { emoji: '🟢', label: 'Normal', color: 'text-green-600' };
    if (c.includes('sobre')) return { emoji: '🟡', label: 'Sobrepeso', color: 'text-yellow-600' };
    if (c.includes('bajo')) return { emoji: '🟠', label: 'Bajo peso', color: 'text-orange-600' };
    if (c.includes('obesidad')) return { emoji: '🔴', label: 'Obesidad', color: 'text-red-600' };
    return { emoji: '⚪', label: clasificacion, color: 'text-gray-500' };
  };

  // Lógica de filtrado
  const filteredAsistencias = asistencias.filter(item => {
    const matchesSearch = item.codigo_estudiante.toString().includes(searchTerm);
    
    // Accedemos a la primera valoración si existe
    const valoraciones = item.estudiantes?.valoraciones_nutricionales;
    const clasificacion = valoraciones && valoraciones.length > 0 ? valoraciones[0].clasificacion_minsalud : '';
    
    const matchesAlert = isAlertMode 
      ? (clasificacion.toLowerCase().includes('bajo') || clasificacion.toLowerCase().includes('sobre') || clasificacion.toLowerCase().includes('obesidad')) 
      : true;
      
    return matchesSearch && matchesAlert;
  });

  const exportToExcel = async () => {
    if (!startDate || !endDate) return alert("Por favor selecciona ambas fechas");
    const worksheet = XLSX.utils.json_to_sheet(asistencias.map(item => ({
      Codigo: item.codigo_estudiante,
      Estudiante: item.estudiantes ? `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'N/A',
      Fecha: new Date(item.fecha_hora).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");
    XLSX.writeFile(workbook, `Reporte_Asistencias.xlsx`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#135838] mb-6">Historial de Entregas</h2>
      
      {!loading && <AdminDashboard rawData={asistencias} />}

      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8">
        <div className="flex flex-wrap gap-4 items-end justify-center mb-6">
          <input type="date" className="p-2 border rounded" onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" className="p-2 border rounded" onChange={(e) => setEndDate(e.target.value)} />
          <button onClick={exportToExcel} className="bg-[#135838] text-white px-6 py-2 rounded font-bold hover:bg-green-800">Exportar</button>
        </div>

        <div className="flex gap-4 items-end justify-center pt-4 border-t border-gray-200">
          <input 
            type="text" 
            placeholder="Buscar por código..." 
            className="w-full max-w-sm p-2 border rounded" 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={() => setIsAlertMode(!isAlertMode)}
            className={`p-2 rounded text-2xl border ${isAlertMode ? 'bg-yellow-100 border-yellow-400' : 'bg-white'}`}
          >
            ⚠️
          </button>
        </div>
      </div>

      {loading ? <p>Cargando...</p> : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Estudiante</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsistencias.map((item) => {
                const val = item.estudiantes?.valoraciones_nutricionales;
                const clasificacion = val && val.length > 0 ? val[0].clasificacion_minsalud : null;
                const status = getStatusIndicator(clasificacion);

                return (
                  <tr key={item.id} className="hover:bg-gray-50 border-b">
                    <td className="p-3">{item.codigo_estudiante}</td>
                    <td className="p-3">{item.estudiantes ? `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'N/A'}</td>
                    <td className="p-3 font-semibold">
                      <span className={`flex items-center gap-1 ${status.color}`}>
                        {status.emoji} {status.label}
                      </span>
                    </td>
                    <td className="p-3">{new Date(item.fecha_hora).toLocaleString()}</td>
                    <td className="p-3">
                      <button onClick={() => setSelectedCodigo(item.codigo_estudiante)} className="bg-[#135838] text-white px-3 py-1 rounded text-sm hover:bg-green-800">
                        Ver Evolución
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCodigo && (
        <EvolucionModal codigoEstudiante={selectedCodigo} onClose={() => setSelectedCodigo(null)} />
      )}
    </div>
  );
}