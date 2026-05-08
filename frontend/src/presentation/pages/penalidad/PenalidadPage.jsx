import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesPenalidad = [
  {
    label: "Crear penalidad",
    route: "/penalidad/crear",
    icon: "add_box",
    buttonClassName: "bg-[#AD0209] text-white hover:bg-[#8f0107]",
  },
  {
    label: "Actualizar",
    route: "/penalidad/modificar",
    icon: "cached",
    buttonClassName: "bg-[#AD0209] text-white hover:bg-[#8f0107]",
  },
  {
    label: "Imprimir",
    route: "/penalidad/imprimir",
    icon: "print_connect",
    buttonClassName: "bg-[#AD0209] text-white hover:bg-[#8f0107]",
  },
];

export function PenalidadPage() {
  return <SectionPage titulo="Penalidad" acciones={accionesPenalidad} baseRoute="/penalidad" />;
}
