import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesInformes = [
  { label: "Crear informe", route: "/informes/crear" },
  { label: "Modificar informe", route: "/informes/modificar" },
  { label: "Imprimir informe", route: "/informes/imprimir" },
];

export function InformesPage() {
  return <SectionPage titulo="Informes" acciones={accionesInformes} baseRoute="/informes" />;
}
