import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesAbsorciones = [
  {
    label: "Crear absorción",
    route: "/absorciones/crear",
    icon: "add_box",
    buttonClassName: "bg-[#228B22] text-white hover:bg-[#1b6f1b]",
  },
  {
    label: "Modificar absorción",
    route: "/absorciones/modificar",
    icon: "cached",
    buttonClassName: "bg-[#228B22] text-white hover:bg-[#1b6f1b]",
  },
  {
    label: "Imprimir absorción",
    route: "/absorciones/imprimir",
    icon: "print_connect",
    buttonClassName: "bg-[#228B22] text-white hover:bg-[#1b6f1b]",
  },
];

export function AbsorcionesPage() {
  return <SectionPage titulo="Absorciones" acciones={accionesAbsorciones} baseRoute="/absorciones" />;
}
