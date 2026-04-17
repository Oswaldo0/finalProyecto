import { AppHeader } from "./components/AppHeader.jsx";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BlankPage } from "./pages/BlankPage.jsx";
import { UserPage } from "./pages/UserPage.jsx";
import { navRoutes, routeLabels, userMenuRoutes } from "./routes.js";

function RouteBreadcrumb() {
  const { pathname } = useLocation();
  const label = routeLabels[pathname];
  if (!label) return null;
  return (
    <div className="border-b border-slate-100 bg-white/70 px-4 py-1.5 sm:px-6">
      <p className="mx-auto max-w-6xl text-xs text-slate-400">
        <span className="font-medium text-slate-500">Inicio</span>
        <span className="mx-1.5">/</span>
        <span className="font-semibold text-slate-700">{label}</span>
      </p>
    </div>
  );
}

export function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dde3eb_0%,_#edf1f5_38%,_#ffffff_100%)] text-slate-800">
      <AppHeader />
      <RouteBreadcrumb />

      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        {navRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<BlankPage title={route.label} />}
          />
        ))}
        {userMenuRoutes.map((route) =>
          route.path === "/usuario" ? (
            <Route key={route.path} path={route.path} element={<UserPage />} />
          ) : (
            <Route
              key={route.path}
              path={route.path}
              element={<BlankPage title={route.label} />}
            />
          ),
        )}
      </Routes>
    </div>
  );
}
