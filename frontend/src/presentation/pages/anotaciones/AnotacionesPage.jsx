import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesAnotaciones = [
  {
    label: "Crear anotación",
    route: "/anotaciones/crear",
    icon: "add_box",
    buttonClassName: "bg-[#FFA500] text-white hover:bg-[#cc8400]",
  },
  {
    label: "Modificar anotación",
    route: "/anotaciones/modificar",
    icon: "cached",
    buttonClassName: "bg-[#FFA500] text-white hover:bg-[#cc8400]",
  },
  {
    label: "Imprimir anotación",
    route: "/anotaciones/imprimir",
    icon: "print_connect",
    buttonClassName: "bg-[#FFA500] text-white hover:bg-[#cc8400]",
  },
];

export function AnotacionesPage() {
  return <SectionPage titulo="Anotaciones" acciones={accionesAnotaciones} baseRoute="/anotaciones" />;
}
