import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import logo from "../../../assets/images/LOGO_USO.png";
import loginBackground from "../../../assets/images/login-background.jpg";
import { iniciarSesion } from "../../../application/auth/authUseCases.js";

export function LoginPage({ isAuthenticated, onLogin }) {
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/penalidad"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const session = await iniciarSesion({ username, password });
      onLogin(session.user);
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="absolute inset-0 bg-slate-950/35" />

      <section className="relative z-10 w-full max-w-md rounded-xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={logo} alt="Universidad de Sonsonate" className="h-16 w-auto" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Sistema Académico</h1>
          <p className="mt-1 text-sm text-slate-500">Acceso seguro a documentos administrativos</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Usuario</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-700"
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-700"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {isSubmitting ? "Validando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </main>
  );
}
