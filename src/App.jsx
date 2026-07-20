import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegistroNutricional from './pages/RegistroNutricional';
import RegistroEntregas from './pages/RegistroEntregas';
import HistorialAsistencias from './pages/HistorialAsistencias';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fcfaf7]">
        {/* Menú de navegación */}
        <nav className="bg-[#135838] p-4 text-white flex gap-6 justify-center shadow-md">
          <Link to="/" className="hover:text-[#cda851] font-bold transition-colors">Registro Nutricional</Link>
          <Link to="/entregas" className="hover:text-[#cda851] font-bold transition-colors">Registrar Asistencia</Link>
          <Link to="/historial" className="hover:text-[#cda851] font-bold">Historial (Admin)</Link>
        </nav>
        

        {/* Definición de rutas */}
        <Routes>
          <Route path="/" element={<RegistroNutricional />} />
          <Route path="/entregas" element={<RegistroEntregas />} />
          <Route path="/historial" element={<HistorialAsistencias />} />
        </Routes>
      </div>
    </BrowserRouter>

    
  );
}