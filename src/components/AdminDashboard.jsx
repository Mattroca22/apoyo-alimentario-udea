import React from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import ResumenImpacto from './ResumenImpacto';

export default function AdminDashboard({ rawData }) {
  // --- Lógica de datos ---
  const datosTiempo = {};
  const datosQuinquenios = {};
  const datosFacultad = {};

  rawData.forEach(item => {
    // 1. Asistencias en el tiempo
    const fecha = new Date(item.fecha_hora).toLocaleDateString();
    datosTiempo[fecha] = (datosTiempo[fecha] || 0) + 1;

    // 2. Histograma de Edades en Quinquenios (compatible con distintas estructuras de Supabase)
    const edad = item.estudiantes?.edad || item.estudiantes?.valoraciones_nutricionales?.[0]?.edad;
    if (edad !== undefined && edad !== null) {
      const inicioQuinquenio = Math.floor(edad / 5) * 5;
      const rango = `${inicioQuinquenio} - ${inicioQuinquenio + 4}`;
      datosQuinquenios[rango] = (datosQuinquenios[rango] || 0) + 1;
    }

    // 3. Asistencias por Facultad
    const facultad = item.estudiantes?.facultad || 'Sin Facultad';
    datosFacultad[facultad] = (datosFacultad[facultad] || 0) + 1;
  });

  const chartDataTiempo = Object.keys(datosTiempo).map(k => ({ name: k, total: datosTiempo[k] }));
  
  // Ordenar los quinquenios numéricamente
  const chartDataQuinquenios = Object.keys(datosQuinquenios)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(k => ({ name: k, total: datosQuinquenios[k] }));

  const chartDataFacultad = Object.keys(datosFacultad).map(k => ({ name: k, total: datosFacultad[k] }));
  const COLORS = ['#135838', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full">
      {/* GRID: Solo contiene los 3 gráficos de arriba */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Gráfico 1: Asistencias en el tiempo */}
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

        {/* Gráfico 2: Histograma de Edades en Quinquenios */}
        <div className="bg-white p-4 shadow rounded border">
          <h3 className="font-bold mb-2">Distribución por Edades (Quinquenios)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartDataQuinquenios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <Tooltip />
              <Bar dataKey="total" fill="#135838" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico 3: Asistencias por Facultad */}
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