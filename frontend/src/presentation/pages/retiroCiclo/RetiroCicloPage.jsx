import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesRetiro = [
  {
    label: "Crear retiro",
    route: "/retiro-ciclo/crear",
    icon: "add_box",
    buttonClassName: "bg-[#008B8B] text-white hover:bg-[#006f6f]",
  },
  {
    label: "Modificar retiro",
    route: "/retiro-ciclo/modificar",
    icon: "cached",
    buttonClassName: "bg-[#008B8B] text-white hover:bg-[#006f6f]",
  },
  {
    label: "Imprimir retiro",
    route: "/retiro-ciclo/imprimir",
    icon: "print_connect",
    buttonClassName: "bg-[#008B8B] text-white hover:bg-[#006f6f]",
  },
];

export function RetiroCicloPage() {
  return <SectionPage titulo="Retiro Ciclo" acciones={accionesRetiro} baseRoute="/retiro-ciclo" />;
}
