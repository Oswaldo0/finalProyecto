import { AppHeader } from "./components/AppHeader.jsx";
import { Navigate, Route, Routes } from "react-router-dom";
import { BlankPage } from "./pages/BlankPage.jsx";
import { navRoutes, userMenuRoutes } from "./routes.js";

export function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dde3eb_0%,_#edf1f5_38%,_#ffffff_100%)] text-slate-800">
      <AppHeader />

      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        {navRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<BlankPage title={route.label} />}
          />
        ))}
        {userMenuRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<BlankPage title={route.label} />}
          />
        ))}
      </Routes>
    </div>
  );
}
