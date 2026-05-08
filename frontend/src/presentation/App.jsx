import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader.jsx";
import { EmptySectionPage } from "./components/shared/EmptySectionPage.jsx";
import { navRoutes } from "./routes.js";
import { CrearAbsorcionPage } from "./pages/absorciones/CrearAbsorcionPage.jsx";
import { ImprimirAbsorcionPage } from "./pages/absorciones/ImprimirAbsorcionPage.jsx";
import { ModificarAbsorcionPage } from "./pages/absorciones/ModificarAbsorcionPage.jsx";
import { AbsorcionesPage } from "./pages/absorciones/AbsorcionesPage.jsx";
import { AnotacionesPage } from "./pages/anotaciones/AnotacionesPage.jsx";
import { ImprimirAnotacionPage } from "./pages/anotaciones/ImprimirAnotacionPage.jsx";
import { ModificarAnotacionPage } from "./pages/anotaciones/ModificarAnotacionPage.jsx";
import { CrearEquivalenciaPage } from "./pages/equivalencias/CrearEquivalenciaPage.jsx";
import { EquivalenciasPage } from "./pages/equivalencias/EquivalenciasPage.jsx";
import { ImprimirEquivalenciaPage } from "./pages/equivalencias/ImprimirEquivalenciaPage.jsx";
import { ModificarEquivalenciaPage } from "./pages/equivalencias/ModificarEquivalenciaPage.jsx";
import { InformesPage } from "./pages/informes/InformesPage.jsx";
import { CrearPenalidadPage } from "./pages/penalidad/CrearPenalidadPage.jsx";
import { ImprimirPenalidadPage } from "./pages/penalidad/ImprimirPenalidadPage.jsx";
import { ModificarPenalidadPage } from "./pages/penalidad/ModificarPenalidadPage.jsx";
import { PenalidadPage } from "./pages/penalidad/PenalidadPage.jsx";
import { CrearRetiroCicloPage } from "./pages/retiroCiclo/CrearRetiroCicloPage.jsx";
import { ImprimirRetiroCicloPage } from "./pages/retiroCiclo/ImprimirRetiroCicloPage.jsx";
import { ModificarRetiroCicloPage } from "./pages/retiroCiclo/ModificarRetiroCicloPage.jsx";
import { RetiroCicloPage } from "./pages/retiroCiclo/RetiroCicloPage.jsx";

export function App() {
  return (
    <div className="min-h-screen bg-white" aria-label="sitio-vacio">
      <AppHeader />

      <Routes>
        <Route path="/" element={<Navigate to={navRoutes[0].path} replace />} />

        <Route path="/penalidad" element={<PenalidadPage />} />
        <Route path="/penalidad/crear" element={<CrearPenalidadPage />} />
        <Route path="/penalidad/modificar" element={<ModificarPenalidadPage />} />
        <Route path="/penalidad/imprimir" element={<ImprimirPenalidadPage />} />

        <Route path="/retiro-ciclo" element={<RetiroCicloPage />} />
        <Route path="/retiro-ciclo/crear" element={<CrearRetiroCicloPage />} />
        <Route path="/retiro-ciclo/modificar" element={<ModificarRetiroCicloPage />} />
        <Route path="/retiro-ciclo/imprimir" element={<ImprimirRetiroCicloPage />} />

        <Route path="/equivalencias" element={<EquivalenciasPage />} />
        <Route path="/equivalencias/crear" element={<CrearEquivalenciaPage />} />
        <Route path="/equivalencias/modificar" element={<ModificarEquivalenciaPage />} />
        <Route path="/equivalencias/imprimir" element={<ImprimirEquivalenciaPage />} />

        <Route path="/absorciones" element={<AbsorcionesPage />} />
        <Route path="/absorciones/crear" element={<CrearAbsorcionPage />} />
        <Route path="/absorciones/modificar" element={<ModificarAbsorcionPage />} />
        <Route path="/absorciones/imprimir" element={<ImprimirAbsorcionPage />} />

        <Route path="/anotaciones" element={<AnotacionesPage />} />
        <Route path="/anotaciones/crear" element={<EmptySectionPage title="Crear anotación" />} />
        <Route path="/anotaciones/modificar" element={<ModificarAnotacionPage />} />
        <Route path="/anotaciones/imprimir" element={<ImprimirAnotacionPage />} />

        <Route path="/informes" element={<InformesPage />} />
        <Route path="/informes/crear" element={<EmptySectionPage title="Crear informe" />} />
        <Route path="/informes/modificar" element={<EmptySectionPage title="Modificar informe" />} />
        <Route path="/informes/imprimir" element={<EmptySectionPage title="Imprimir informe" />} />

        <Route path="/usuario" element={<EmptySectionPage title="Usuario" />} />

        <Route path="*" element={<Navigate to={navRoutes[0].path} replace />} />
      </Routes>
    </div>
  );
}
