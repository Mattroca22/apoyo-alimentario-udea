import React from 'react';

export default function ResumenImpacto({ rawData }) {
  const calcularImpactoNutricional = (asistencias) => {
    if (!asistencias || asistencias.length === 0) return [];
    
    const agrupado = asistencias.reduce((acc, curr) => {
      const valoraciones = curr.estudiantes?.valoraciones_nutricionales;
      
      // CAMBIO AQUÍ: Ahora si no hay valoraciones, los agrupamos en 'Bajo peso'
      const clasificacion = valoraciones && valoraciones.length > 0 
        ? valoraciones[0].clasificacion_minsalud 
        : 'Bajo peso';
      
      if (!acc[clasificacion]) {
        acc[clasificacion] = { totalAsistencias: 0, estudiantesUnicos: new Set() };
      }
      
      acc[clasificacion].totalAsistencias += 1;
      acc[clasificacion].estudiantesUnicos.add(curr.codigo_estudiante);
      
      return acc;
    }, {});

    return Object.keys(agrupado).map(key => ({
      categoria: key,
      promedioAsistencias: (agrupado[key].totalAsistencias / agrupado[key].estudiantesUnicos.size).toFixed(1),
      totalEstudiantes: agrupado[key].estudiantesUnicos.size
    }));
  };

  const datosImpacto = calcularImpactoNutricional(rawData);

  return (
    <div className="w-full mb-8">
      <h3 className="text-xl font-bold text-[#135838] mb-4">Promedio de asistencias por estado nutricional</h3>
      
      <div className="flex flex-row gap-4 w-full">
        {datosImpacto.map((item) => (
          <div 
            key={item.categoria} 
            className="flex-1 bg-white p-3 shadow-md border-l-4 border-[#135838] rounded-lg flex flex-col justify-between"
          >
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase truncate">
                {item.categoria}
              </h4>
              <p className="text-2xl font-black text-[#135838] my-1">
                {item.promedioAsistencias}
              </p>
            </div>
            
            <div className="border-t border-gray-100 pt-1 mt-1">
              <p className="text-[9px] font-semibold text-gray-500 uppercase">
                Prom. por estudiante
              </p>
              <p className="text-[9px] text-gray-400">
                (N={item.totalEstudiantes})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}