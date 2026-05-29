import { create, remove } from './src/infrastructure/repositories/absorcionRepository.js';

const absorcion = {
  facultad_nombre: 'Facultad Prueba',
  ciclo: '2024-1',
  fecha: '2024-05-01',
  alumno_nombres: 'Test',
  alumno_apellidos: 'User',
  carrera_origen: 'Carrera Origen',
  plan_origen: 'Plan Origen',
  plan_solicitado: 'Plan Solicitado',
  encabezado_dictamen: 'Dictamen prueba',
  decano_nombre: 'Decano Prueba',
  facultad_firma_nombre: 'Firma Prueba',
};
(async () => {
  const created = await create({ absorcion });
  console.log(created);
  await remove(created.id);
})();
