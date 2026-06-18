import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  cargarSesionActual,
  cerrarSesion,
  obtenerUsuarioGuardado,
} from "../application/auth/authUseCases.js";
import { AppHeader } from "./components/AppHeader.jsx";
import { EmptySectionPage } from "./components/shared/EmptySectionPage.jsx";
import { navRoutes } from "./routes.js";
import { CrearAbsorcionPage } from "./pages/absorciones/CrearAbsorcionPage.jsx";
import { ImprimirAbsorcionPage } from "./pages/absorciones/ImprimirAbsorcionPage.jsx";
import { ModificarAbsorcionPage } from "./pages/absorciones/ModificarAbsorcionPage.jsx";
import { AbsorcionesPage } from "./pages/absorciones/AbsorcionesPage.jsx";
import { AnotacionesPage } from "./pages/anotaciones/AnotacionesPage.jsx";
import { CrearAnotacionPage } from "./pages/anotaciones/CrearAnotacionPage.jsx";
import { ImprimirAnotacionPage } from "./pages/anotaciones/ImprimirAnotacionPage.jsx";
import { ModificarAnotacionPage } from "./pages/anotaciones/ModificarAnotacionPage.jsx";
import { LoginPage } from "./pages/auth/LoginPage.jsx";
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
import { UsuarioPage } from "./pages/usuario/UsuarioPage.jsx";

function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => obtenerUsuarioGuardado());
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const sessionUser = await cargarSesionActual();
        if (mounted && sessionUser) setUser(sessionUser);
      } catch {
        cerrarSesion();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoadingSession(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function handleLogout() {
    cerrarSesion();
    setUser(null);
    navigate("/login", { replace: true });
  }

  if (isLoadingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-slate-600">
        Cargando sesión...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white" aria-label="sistema-academico">
      {isAuthenticated ? <AppHeader user={user} onLogout={handleLogout} /> : null}

      <Routes>
        <Route
          path="/login"
          element={<LoginPage isAuthenticated={isAuthenticated} onLogin={setUser} />}
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
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
                <Route path="/equivalencias/modificar/:id" element={<ModificarEquivalenciaPage />} />
                <Route path="/equivalencias/imprimir" element={<ImprimirEquivalenciaPage />} />

                <Route path="/absorciones" element={<AbsorcionesPage />} />
                <Route path="/absorciones/crear" element={<CrearAbsorcionPage />} />
                <Route path="/absorciones/modificar" element={<ModificarAbsorcionPage />} />
                <Route path="/absorciones/modificar/:id" element={<ModificarAbsorcionPage />} />
                <Route path="/absorciones/imprimir" element={<ImprimirAbsorcionPage />} />

                <Route path="/anotaciones" element={<AnotacionesPage />} />
                <Route path="/anotaciones/crear" element={<CrearAnotacionPage />} />
                <Route path="/anotaciones/modificar" element={<ModificarAnotacionPage />} />
                <Route path="/anotaciones/modificar/:id" element={<ModificarAnotacionPage />} />
                <Route path="/anotaciones/imprimir" element={<ImprimirAnotacionPage />} />

                <Route path="/informes" element={<InformesPage />} />
                <Route path="/informes/crear" element={<InformesPage />} />
                <Route path="/informes/modificar" element={<InformesPage />} />
                <Route path="/informes/imprimir" element={<InformesPage />} />

                <Route path="/usuario" element={<UsuarioPage user={user} />} />

                <Route path="*" element={<Navigate to={navRoutes[0].path} replace />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
