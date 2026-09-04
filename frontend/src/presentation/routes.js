import absorcionesIcon from "../assets/images/usoAbosorción.png";
import anotacionesIcon from "../assets/images/usoAnotaciones.png";
import equivalenciasIcon from "../assets/images/usoEquivalencias.png";
import informesIcon from "../assets/images/usoInformes.png";
import penalidadIcon from "../assets/images/usoPenalidad.png";
import retiroCicloIcon from "../assets/images/usoRetiro.png";

export const navRoutes = [
  {
    label: "Penalidad",
    path: "/penalidad",
    icon: penalidadIcon
  },
  {
    label: "Retiro de ciclo",
    path: "/retiro-ciclo",
    icon: retiroCicloIcon
  },
  {
    label: "Equivalencias",
    path: "/equivalencias",
    icon: equivalenciasIcon
  },
  {
    label: "Absorciones",
    path: "/absorciones",
    icon: absorcionesIcon
  },
  {
    label: "Anotaciones",
    path: "/anotaciones",
    icon: anotacionesIcon
  },
  {
    label: "Informes",
    path: "/informes",
    icon: informesIcon,
    iconClassName: "rotate-90"
  },
  {
    label: "Consultas",
    path: "/consultas",
    iconName: "manage_search"
  }
];
