import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import ResumenImpacto from './ResumenImpacto';

export default function AdminDashboard({ rawData }) {
  // --- Lógica de datos ---
  const datosTiempo = {};
  const datosEstudiantes = {};
  const datosFacultad = {};

  rawData.forEach(item => {
    const fecha = new Date(item.fecha_hora).toLocaleDateString();
    datosTiempo[fecha] = (datosTiempo[fecha] || 0) + 1;

    const nombre = item.estudiantes ? `${item.estudiantes.nombres} ${item.estudiantes.apellidos}` : 'N/A';
    datosEstudiantes[nombre] = (datosEstudiantes[nombre] || 0) + 1;

    const facultad = item.estudiantes?.facultad || 'Sin Facultad';
    datosFacultad[facultad] = (datosFacultad[facultad] || 0) + 1;
  });

  const chartDataTiempo = Object.keys(datosTiempo).map(k => ({ name: k, total: datosTiempo[k] }));
  const chartDataEstudiantes = Object.keys(datosEstudiantes).map(k => ({ name: k, total: datosEstudiantes[k] }));
  const chartDataFacultad = Object.keys(datosFacultad).map(k => ({ name: k, total: datosFacultad[k] }));
  const COLORS = ['#135838', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full">
      {/* GRID: Solo contiene los 3 gráficos de arriba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <div className="bg-white p-4 shadow rounded border">
          <h3 className="font-bold mb-2">Asistencias en el tiempo</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartDataTiempo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#135838" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow rounded border">
          <h3 className="font-bold mb-2">Asistencias por Estudiante</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartDataEstudiantes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <Tooltip />
              <Bar dataKey="total" fill="#135838" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow rounded border">
          <h3 className="font-bold mb-2">Asistencias por Facultad</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartDataFacultad} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                {chartDataFacultad.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ESTE COMPONENTE AHORA ESTÁ FUERA DEL GRID Y USARÁ TODO EL ANCHO */}
      <div className="w-full">
        <ResumenImpacto rawData={rawData} />
      </div>
    </div>
  );
}