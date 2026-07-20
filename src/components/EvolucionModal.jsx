import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function EvolucionModal({ codigoEstudiante, onClose }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      const { data } = await supabase
        .from('valoraciones_nutricionales')
        .select('*')
        .eq('codigo_estudiante', codigoEstudiante)
        .order('fecha_valoracion', { ascending: true }); // Ordenamos cronológicamente (antiguo -> nuevo)
      
      setHistorial(data || []);
    };
    fetchHistorial();
  }, [codigoEstudiante]);

  // LÓGICA DEL MOTOR DE TENDENCIAS
  const getTendencia = (actual, anterior, clasificacion) => {
    if (!anterior) return { color: 'text-gray-400', icon: '—', label: 'Inicio' };
    
    const pesoSubio = actual.peso_kg > anterior.peso_kg;
    const pesoBajo = actual.peso_kg < anterior.peso_kg;
    const diag = clasificacion.toLowerCase();

    // Lógica: Sobrepeso (Objetivo: Bajar)
    if (diag.includes('sobrepeso')) {
      if (pesoBajo) return { color: 'text-green-600', icon: '↓', label: 'Mejorando' };
      if (pesoSubio) return { color: 'text-red-600', icon: '↑', label: 'Alerta' };
    }
    
    // Lógica: Bajo peso (Objetivo: Subir)
    if (diag.includes('bajo')) {
      if (pesoSubio) return { color: 'text-green-600', icon: '↑', label: 'Mejorando' };
      if (pesoBajo) return { color: 'text-red-600', icon: '↓', label: 'Alerta' };
    }

    return { color: 'text-gray-500', icon: '•', label: 'Estable' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#135838]">Seguimiento: Estudiante {codigoEstudiante}</h2>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cerrar</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Peso (kg)</th>
                <th className="p-3">IMC</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-center">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => {
                const anterior = historial[index - 1]; // Comparar con el previo en el array ordenado
                const tendencia = getTendencia(item, anterior, item.clasificacion_minsalud);
                
                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50 text-sm">
                    <td className="p-3">{new Date(item.fecha_valoracion).toLocaleDateString()}</td>
                    <td className="p-3">{item.peso_kg} kg</td>
                    <td className="p-3 font-semibold text-gray-800">{item.imc || 'N/A'}</td>
                    <td className="p-3 font-medium">{item.clasificacion_minsalud}</td>
                    <td className={`p-3 text-center font-bold ${tendencia.color}`}>
                      <span className="text-xl">{tendencia.icon}</span> 
                      <span className="text-xs block">{tendencia.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}