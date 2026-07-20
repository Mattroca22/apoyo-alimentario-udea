import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import AdminDashboard from '../components/AdminDashboard';
import * as XLSX from 'xlsx';
import EvolucionModal from '../components/EvolucionModal';

export default function HistorialAsistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los filtros de fecha
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Estado para el modal de evolución
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  // Estados para la búsqueda y el modo de alerta
  const [searchTerm, setSearchTerm] = useState('');
  const [isAlertMode, setIsAlertMode] = useState(false);  



  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('asistencias')
      .select('*, estudiantes(nombres, apellidos, facultad)')
      .order('fecha_hora', { ascending: false });

    if (error) console.error("Error:", error);
    else setAsistencias(data);
    setLoading(false);
  };

  const exportToExcel = async () => {
    if (!startDate || !endDate) return alert("Por favor selecciona ambas fechas");
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const diffMonths = (end - start) / (1000 * 60 * 60 * 24 * 30);

    if (end > today) return alert("La fecha final no puede ser futura");
    if (diffMonths > 4) return alert("El rango no puede ser mayor a 4 meses");

    const { data, error } = await supabase
      .from('asistencias')
      .select('*, estudiantes(nombres, apellidos, facultad)')
      .gte('fecha_hora', startDate)
      .lte('fecha_hora', endDate);

    if (error) return alert("Error al obtener los datos");

    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      Codigo: item.codigo_estudiante,
      Estudiante: item.estudiantes ? `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'N/A',
      Facultad: item.estudiantes?.facultad || 'N/A',
      Fecha: new Date(item.fecha_hora).toLocaleString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");
    XLSX.writeFile(workbook, `Reporte_Asistencias_${startDate}_a_${endDate}.xlsx`);
  };
  

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#135838] mb-6">Historial de Entregas</h2>
      
      {!loading && <AdminDashboard rawData={asistencias} />}

      <div className="flex justify-center items-end gap-4 my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Desde</label>
          <input type="date" className="p-2 border rounded" onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Hasta</label>
          <input type="date" className="p-2 border rounded" onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button 
          onClick={exportToExcel}
          className="bg-[#135838] text-white px-6 py-2 rounded font-bold hover:bg-green-800 transition"
        >
          Exportar a Excel
        </button>
      </div>

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
                <th className="p-3 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3">{item.codigo_estudiante}</td>
                  <td className="p-3">
                    {item.estudiantes ? `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'Estudiante no registrado'}
                  </td>
                  <td className="p-3">{new Date(item.fecha_hora).toLocaleString()}</td>
                  <td className="p-3">
                    <button 
                      onClick={() => setSelectedCodigo(item.codigo_estudiante)}
                      className="bg-[#135838] text-white px-3 py-1 rounded text-sm hover:bg-green-800 transition"
                    >
                      Ver Evolución
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Evolución */}
      {selectedCodigo && (
        <EvolucionModal 
          codigoEstudiante={selectedCodigo} 
          onClose={() => setSelectedCodigo(null)} 
        />
      )}
    </div>
  );
}