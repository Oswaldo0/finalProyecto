export const navRoutes = [
  { label: "Inicio", path: "/inicio" },
  { label: "Estudiantes", path: "/estudiantes" },
  { label: "Facultades", path: "/facultades" },
  { label: "Planeación", path: "/planeacion" },
  { label: "Solicitudes", path: "/solicitudes" },
  { label: "Reportes", path: "/reportes" },
];

export const userMenuRoutes = [
  { label: "Usuario", path: "/usuario" },
  { label: "Modulos mantenimiento", path: "/modulos-mantenimiento" },
  { label: "Modo coordinador", path: "/modo-coordinador" },
  { label: "Salir", path: "/salir" },
];

export const routeLabels = Object.fromEntries(
  [...navRoutes, ...userMenuRoutes].map((r) => [r.path, r.label])
);
