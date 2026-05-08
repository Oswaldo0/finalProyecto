import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesEquivalencias = [
  {
    label: "Crear equivalencia",
    route: "/equivalencias/crear",
    icon: "add_box",
    buttonClassName: "bg-[#1E90FF] text-white hover:bg-[#1874cd]",
  },
  {
    label: "Modificar equivalencia",
    route: "/equivalencias/modificar",
    icon: "cached",
    buttonClassName: "bg-[#1E90FF] text-white hover:bg-[#1874cd]",
  },
  {
    label: "Imprimir equivalencia",
    route: "/equivalencias/imprimir",
    icon: "print_connect",
    buttonClassName: "bg-[#1E90FF] text-white hover:bg-[#1874cd]",
  },
];

export function EquivalenciasPage() {
  return <SectionPage titulo="Equivalencias" acciones={accionesEquivalencias} baseRoute="/equivalencias" />;
}
