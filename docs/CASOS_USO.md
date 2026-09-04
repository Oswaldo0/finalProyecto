# Casos de uso del Sistema Académico USO

## 1. Descripción general

El Sistema Académico USO permite gestionar documentos administrativos académicos relacionados con penalidades, retiros de ciclo, equivalencias, absorciones, anotaciones, consultas, usuarios e informes.

El sistema está orientado a usuarios administrativos autorizados y cuenta con control de acceso por rol.

## 2. Actores

| Actor | Descripción |
| --- | --- |
| Administrador | Usuario con acceso completo. Gestiona usuarios, documentos, reportes y configuración operativa. |
| Decano | Usuario autorizado para revisar, registrar, modificar o imprimir documentos académicos según su función. |
| Secretario | Usuario que registra y gestiona documentos administrativos académicos. |
| Operador | Usuario que realiza captura, modificación, consulta e impresión de documentos. |
| Consulta | Usuario con acceso principalmente orientado a revisión y consulta de información. |

## 3. Diagrama textual de actores y casos de uso

```text
Administrador
 ├─ Iniciar sesión
 ├─ Gestionar usuarios
 ├─ Gestionar penalidades
 ├─ Gestionar retiros de ciclo
 ├─ Gestionar equivalencias
 ├─ Gestionar absorciones
 ├─ Gestionar anotaciones
 ├─ Gestionar consultas
 ├─ Consultar reportes
 ├─ Imprimir reportes PDF
 └─ Cerrar sesión

Decano / Secretario / Operador
 ├─ Iniciar sesión
 ├─ Crear documentos académicos
 ├─ Modificar documentos académicos
 ├─ Imprimir documentos académicos
 ├─ Consultar reportes
 └─ Cerrar sesión

Consulta
 ├─ Iniciar sesión
 ├─ Consultar documentos
 ├─ Consultar reportes
 └─ Cerrar sesión
```

## 4. Listado general de casos de uso

| Código | Caso de uso | Actor principal |
| --- | --- | --- |
| CU-01 | Iniciar sesión | Todos los usuarios |
| CU-02 | Cerrar sesión | Todos los usuarios |
| CU-03 | Gestionar usuarios | Administrador |
| CU-04 | Crear penalidad | Administrador, Decano, Secretario, Operador |
| CU-05 | Modificar penalidad | Administrador, Decano, Secretario, Operador |
| CU-06 | Imprimir penalidad | Administrador, Decano, Secretario, Operador, Consulta |
| CU-07 | Crear retiro de ciclo | Administrador, Decano, Secretario, Operador |
| CU-08 | Modificar retiro de ciclo | Administrador, Decano, Secretario, Operador |
| CU-09 | Imprimir retiro de ciclo | Administrador, Decano, Secretario, Operador, Consulta |
| CU-10 | Crear equivalencia | Administrador, Decano, Secretario, Operador |
| CU-11 | Modificar equivalencia | Administrador, Decano, Secretario, Operador |
| CU-12 | Imprimir equivalencia | Administrador, Decano, Secretario, Operador, Consulta |
| CU-13 | Crear absorción | Administrador, Decano, Secretario, Operador |
| CU-14 | Modificar absorción | Administrador, Decano, Secretario, Operador |
| CU-15 | Imprimir absorción | Administrador, Decano, Secretario, Operador, Consulta |
| CU-16 | Crear anotación | Administrador, Decano, Secretario, Operador |
| CU-17 | Modificar anotación | Administrador, Decano, Secretario, Operador |
| CU-18 | Imprimir anotación | Administrador, Decano, Secretario, Operador, Consulta |
| CU-19 | Crear consulta estudiantil | Administrador, Decano, Secretario, Operador |
| CU-20 | Modificar consulta estudiantil | Administrador, Decano, Secretario, Operador |
| CU-21 | Imprimir consulta estudiantil | Administrador, Decano, Secretario, Operador, Consulta |
| CU-22 | Consultar dashboard de reportes | Todos los usuarios autorizados |
| CU-23 | Consultar histórico de reportes | Todos los usuarios autorizados |
| CU-24 | Imprimir reporte PDF | Todos los usuarios autorizados |

## 5. Especificación de casos de uso

### CU-01: Iniciar sesión

| Campo | Detalle |
| --- | --- |
| Actor principal | Todos los usuarios |
| Objetivo | Permitir el acceso seguro al sistema. |
| Precondiciones | El usuario debe estar registrado y activo. |
| Postcondiciones | El usuario accede a los módulos permitidos por su rol. |

Flujo principal:

1. El usuario abre la pantalla de inicio de sesión.
2. Ingresa usuario y contraseña.
3. Presiona `Iniciar sesión`.
4. El sistema valida las credenciales.
5. El sistema crea la sesión y muestra el menú principal.

Flujos alternos:

- A1: Credenciales incorrectas. El sistema muestra un mensaje de error.
- A2: Usuario bloqueado o inactivo. El sistema deniega el acceso.

### CU-02: Cerrar sesión

| Campo | Detalle |
| --- | --- |
| Actor principal | Todos los usuarios |
| Objetivo | Finalizar la sesión activa. |
| Precondiciones | El usuario debe haber iniciado sesión. |
| Postcondiciones | El usuario vuelve a la pantalla de inicio de sesión. |

Flujo principal:

1. El usuario presiona la opción de cerrar sesión.
2. El sistema elimina la sesión guardada.
3. El sistema redirige al inicio de sesión.

### CU-03: Gestionar usuarios

| Campo | Detalle |
| --- | --- |
| Actor principal | Administrador |
| Objetivo | Crear y administrar usuarios del sistema. |
| Precondiciones | El actor debe tener rol `ADMIN`. |
| Postcondiciones | El usuario queda creado o actualizado. |

Flujo principal:

1. El administrador ingresa al módulo `Usuarios`.
2. Completa nombre, usuario, correo, contraseña y rol.
3. Presiona `Crear`.
4. El sistema valida los datos.
5. El sistema guarda el usuario.
6. El sistema muestra el usuario en la lista.

Flujos alternos:

- A1: Usuario o correo duplicado. El sistema rechaza el registro.
- A2: Campos obligatorios vacíos. El sistema solicita completar la información.

### CU-04: Crear penalidad

| Campo | Detalle |
| --- | --- |
| Actor principal | Administrador, Decano, Secretario, Operador |
| Objetivo | Registrar una penalidad académica. |
| Precondiciones | El usuario debe estar autenticado y autorizado. |
| Postcondiciones | La penalidad queda registrada con su correlativo y estado inicial. |

Flujo principal:

1. El usuario ingresa a `Penalidad`.
2. Presiona `Crear penalidad`.
3. Completa los datos del estudiante, carrera, ciclo y autoridades.
4. Agrega las asignaturas correspondientes.
5. Revisa las unidades valorativas.
6. Presiona `Guardar`.
7. El sistema valida y guarda la penalidad.

Flujos alternos:

- A1: Faltan asignaturas. El sistema solicita al menos un detalle.
- A2: Datos obligatorios vacíos. El sistema muestra validaciones.

### CU-05: Modificar penalidad

| Campo | Detalle |
| --- | --- |
| Actor principal | Administrador, Decano, Secretario, Operador |
| Objetivo | Actualizar una penalidad registrada. |
| Precondiciones | Debe existir una penalidad registrada. |
| Postcondiciones | La penalidad queda actualizada. |

Flujo principal:

1. El usuario ingresa a `Penalidad`.
2. Presiona `Modificar`.
3. Busca el registro.
4. Selecciona la penalidad.
5. Edita los datos necesarios.
6. Presiona `Guardar cambios`.
7. El sistema actualiza el registro.

### CU-06: Imprimir penalidad

| Campo | Detalle |
| --- | --- |
| Actor principal | Usuario autorizado |
| Objetivo | Generar la vista imprimible de una penalidad. |
| Precondiciones | Debe existir una penalidad registrada. |
| Postcondiciones | El documento queda disponible para impresión. |

Flujo principal:

1. El usuario ingresa a `Penalidad`.
2. Presiona `Imprimir`.
3. Selecciona el documento.
4. Presiona el botón de impresión.
5. El sistema genera la vista imprimible.

## 6. Casos de uso por patrón CRUD documental

Los módulos Retiro de ciclo, Equivalencias, Absorciones, Anotaciones y Consultas comparten una estructura funcional similar: crear, modificar e imprimir.

### CU-07, CU-10, CU-13, CU-16, CU-19: Crear documento

| Campo | Detalle |
| --- | --- |
| Actor principal | Administrador, Decano, Secretario, Operador |
| Objetivo | Registrar un nuevo documento académico administrativo. |
| Precondiciones | El usuario debe estar autenticado y autorizado. |
| Postcondiciones | El documento queda registrado y disponible para consulta o impresión. |

Flujo principal:

1. El usuario ingresa al módulo correspondiente.
2. Presiona `Crear`.
3. Completa los datos generales del documento.
4. Completa datos académicos como ciclo, año, carrera, materia o plan.
5. Agrega detalles cuando el módulo lo requiere.
6. Presiona `Guardar`.
7. El sistema valida la información.
8. El sistema registra el documento.

Reglas importantes:

- El ciclo debe registrarse como `I`, `II` o `INTERCICLO`, junto con el año.
- Las unidades valorativas deben calcularse correctamente a partir de horas académicas.
- Los documentos con detalle deben tener al menos una fila válida.

### CU-08, CU-11, CU-14, CU-17, CU-20: Modificar documento

| Campo | Detalle |
| --- | --- |
| Actor principal | Administrador, Decano, Secretario, Operador |
| Objetivo | Actualizar información de un documento existente. |
| Precondiciones | Debe existir un documento registrado. |
| Postcondiciones | El documento queda actualizado. |

Flujo principal:

1. El usuario ingresa al módulo.
2. Presiona `Modificar`.
3. Busca el documento en la tabla.
4. Selecciona el registro.
5. Edita los campos requeridos.
6. Presiona `Guardar cambios`.
7. El sistema valida y actualiza los datos.

Flujos alternos:

- A1: No se encuentran resultados. El sistema muestra mensaje de búsqueda vacía.
- A2: El usuario cancela. El sistema retorna al módulo principal.

### CU-09, CU-12, CU-15, CU-18, CU-21: Imprimir documento

| Campo | Detalle |
| --- | --- |
| Actor principal | Usuario autorizado |
| Objetivo | Generar documento imprimible. |
| Precondiciones | Debe existir un documento registrado. |
| Postcondiciones | El documento queda listo para impresión o PDF. |

Flujo principal:

1. El usuario ingresa al módulo.
2. Presiona `Imprimir`.
3. Selecciona el documento.
4. Presiona el botón de impresión.
5. El sistema abre la vista imprimible.

## 7. Casos de uso de informes

### CU-22: Consultar dashboard de reportes

| Campo | Detalle |
| --- | --- |
| Actor principal | Usuario autorizado |
| Objetivo | Visualizar indicadores y gráficos de reportes. |
| Precondiciones | El usuario debe estar autenticado. |
| Postcondiciones | El dashboard muestra información filtrada. |

Flujo principal:

1. El usuario ingresa a `Informes`.
2. Presiona `Reportes`.
3. Selecciona filtros: año, ciclo, materia, tipo de reporte o coordinador.
4. Presiona `Filtrar`.
5. El sistema actualiza indicadores y gráficos.

Información presentada:

- Reportes creados.
- Tipo principal.
- Ciclo con mayor movimiento.
- Coordinador destacado.
- Reportes por mes.
- Reportes por ciclo.
- Materias con más registros.
- Reportes por coordinador.
- Reportes por estado.

### CU-23: Consultar histórico de reportes

| Campo | Detalle |
| --- | --- |
| Actor principal | Usuario autorizado |
| Objetivo | Revisar la tabla histórica de reportes registrados. |
| Precondiciones | Deben existir documentos registrados. |
| Postcondiciones | El usuario visualiza o filtra el histórico. |

Flujo principal:

1. El usuario ingresa a `Informes`.
2. Presiona `Histórico reportes`.
3. El sistema muestra la tabla de reportes.
4. El usuario usa el buscador si necesita localizar un registro específico.

Datos visibles:

- Fecha.
- Tipo.
- Correlativo.
- Alumno o referencia.
- Carrera o facultad.
- Ciclo.
- Materia.
- Coordinador.
- Estado.

### CU-24: Imprimir reporte PDF

| Campo | Detalle |
| --- | --- |
| Actor principal | Usuario autorizado |
| Objetivo | Generar un PDF consolidado de informes. |
| Precondiciones | El usuario debe estar en el módulo `Informes`. |
| Postcondiciones | El sistema genera un PDF con gráficos y tabla histórica. |

Flujo principal:

1. El usuario ingresa a `Informes`.
2. Aplica filtros si es necesario.
3. Presiona `Imprimir reporte PDF`.
4. El sistema genera el PDF.
5. El PDF se abre o descarga según configuración del navegador.

Flujos alternos:

- A1: El navegador bloquea ventanas emergentes. El sistema intenta descargar el archivo.
- A2: Error de generación. El sistema muestra mensaje de error.

## 8. Reglas de negocio principales

| Regla | Descripción |
| --- | --- |
| RN-01 | Todo usuario debe autenticarse antes de usar el sistema. |
| RN-02 | Los módulos protegidos requieren autorización por rol. |
| RN-03 | Los documentos deben tener datos obligatorios completos antes de guardarse. |
| RN-04 | Los documentos con asignaturas deben tener al menos un detalle. |
| RN-05 | El ciclo académico debe registrarse como ciclo y año. |
| RN-06 | Las unidades valorativas se calculan a partir de horas académicas. |
| RN-07 | Las acciones sensibles quedan registradas para auditoría. |
| RN-08 | Los reportes deben respetar los filtros seleccionados. |

## 9. Requisitos funcionales derivados

| Código | Requisito funcional |
| --- | --- |
| RF-01 | El sistema debe permitir inicio y cierre de sesión. |
| RF-02 | El sistema debe permitir crear usuarios con roles. |
| RF-03 | El sistema debe permitir crear, modificar e imprimir penalidades. |
| RF-04 | El sistema debe permitir crear, modificar e imprimir retiros de ciclo. |
| RF-05 | El sistema debe permitir crear, modificar e imprimir equivalencias. |
| RF-06 | El sistema debe permitir crear, modificar e imprimir absorciones. |
| RF-07 | El sistema debe permitir crear, modificar e imprimir anotaciones. |
| RF-08 | El sistema debe permitir crear, modificar e imprimir consultas estudiantiles. |
| RF-09 | El sistema debe permitir filtrar reportes por año, ciclo, materia, tipo y coordinador. |
| RF-10 | El sistema debe permitir generar PDF de reportes. |

