import { SectionPage } from "../../components/shared/SectionPage.jsx";

const accionesConsultas = [
  {
    label: "Crear consulta",
    route: "/consultas/crear",
    icon: "add_box",
    buttonClassName: "bg-[#AD0209] text-white hover:bg-[#8f0107]",
  },
  {
    label: "Historial consulta",
    route: "/consultas/modificar",
    icon: "cached",
    buttonClassName: "bg-[#AD0209] text-white hover:bg-[#8f0107]",
  },
  {
    label: "Imprimir",
    route: "/consultas/imprimir",
    icon: "print_connect",
    buttonClassName: "bg-[#AD0209] text-white hover:bg-[#8f0107]",
  },
];

export function ConsultasPage() {
  return <SectionPage titulo="Consultas" acciones={accionesConsultas} baseRoute="/consultas" />;
}
