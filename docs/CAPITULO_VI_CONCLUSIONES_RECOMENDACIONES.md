# CAPÍTULO VI. CONCLUSIONES Y RECOMENDACIONES

## 6.1 Conclusiones generales

El desarrollo de la aplicación web de apoyo a las actividades de coordinación de carreras en la Universidad de Sonsonate permitió establecer una solución tecnológica orientada a centralizar, organizar y agilizar procesos académicos y administrativos que tradicionalmente se gestionaban mediante documentos físicos, formularios dispersos o registros manuales. A través del sistema desarrollado, fue posible integrar en una sola plataforma módulos relacionados con consultas estudiantiles, anotaciones académicas, equivalencias, absorciones, retiro de ciclo, penalidades, usuarios e informes.

La implementación de una arquitectura por capas contribuyó a mantener una separación adecuada entre la interfaz de usuario, la lógica de negocio, el acceso a datos y la base de datos. Esta estructura favorece la mantenibilidad del sistema, facilita futuras mejoras y permite que cada componente cumpla una responsabilidad específica dentro de la aplicación. Asimismo, el uso de tecnologías como React, Node.js, Express y MySQL permitió construir una solución web funcional, accesible desde navegadores compatibles y adaptable a las necesidades institucionales.

El sistema desarrollado mejora la gestión de la información académica al permitir el registro estructurado de datos, la validación de campos obligatorios, el uso de catálogos controlados y la generación de documentos para impresión. De igual manera, la separación del ciclo académico y el año, así como el cálculo de unidades valorativas en los apartados correspondientes, contribuyen a disminuir errores de registro y fortalecer la consistencia de la información almacenada en la base de datos.

La incorporación del módulo de informes representa un aporte importante para el análisis institucional, ya que permite visualizar información mediante filtros, gráficos y tablas históricas. Esta funcionalidad facilita la consulta de registros por año, ciclo, materia, tipo de reporte y coordinador, proporcionando una base más clara para el seguimiento de procesos académicos y administrativos.

También se concluye que el control de acceso mediante usuarios y roles permite restringir el uso de la aplicación según el nivel de autorización correspondiente. Esta característica fortalece la seguridad del sistema y contribuye a proteger la información registrada, evitando que usuarios no autorizados accedan a funciones administrativas o modifiquen datos sensibles.

En términos generales, la aplicación web desarrollada constituye una alternativa funcional para apoyar la coordinación de carreras, ya que reduce la dependencia de procesos manuales, mejora la organización de documentos, facilita la consulta de información y proporciona herramientas visuales para la generación de reportes. Aunque el sistema fue validado principalmente en un entorno de desarrollo, su estructura permite proyectar una implementación futura dentro de un entorno institucional real.

## 6.2 Conclusiones específicas

Se diseñó una arquitectura por capas que permite separar la presentación, los controladores, los servicios, los repositorios y la base de datos, facilitando la organización interna del sistema y la comprensión de su funcionamiento técnico.

Se desarrollaron módulos funcionales orientados a la gestión de procesos académicos y administrativos, incluyendo consultas, anotaciones, equivalencias, absorciones, retiro de ciclo, penalidades, usuarios e informes.

Se implementaron mecanismos de validación para mejorar la calidad de los datos registrados, especialmente en campos académicos como ciclo, año, materias, estado de documentos y unidades valorativas.

Se integró un módulo de informes con gráficos, filtros e histórico de reportes, lo cual permite analizar los registros creados dentro del sistema y apoyar la toma de decisiones institucionales.

Se incorporó autenticación de usuarios y control de roles, permitiendo que el acceso a las funcionalidades del sistema esté limitado según los permisos asignados.

Se generaron documentos de impresión para los procesos principales, permitiendo conservar evidencia formal de los registros creados y facilitando su uso en trámites académicos.

## 6.3 Limitaciones del estudio

Durante el desarrollo del proyecto se identificaron ciertas limitaciones que deben ser consideradas al momento de interpretar los resultados obtenidos. En primer lugar, la aplicación fue desarrollada y probada principalmente en un entorno local, por lo que no se realizó una implementación completa dentro de la infraestructura tecnológica oficial de la Universidad de Sonsonate.

Otra limitación corresponde a que el sistema no fue integrado con otras plataformas internas de la institución, tales como sistemas de matrícula, registro académico, expedientes estudiantiles oficiales o servicios institucionales de autenticación. Por esta razón, algunos datos deben ser ingresados manualmente por los usuarios autorizados.

Asimismo, aunque se realizaron pruebas funcionales sobre los módulos principales, no se ejecutaron pruebas avanzadas de carga con múltiples usuarios simultáneos. Esto significa que el rendimiento del sistema en un escenario de uso institucional masivo deberá ser evaluado en una etapa posterior.

El alcance del proyecto tampoco contempla acceso directo para estudiantes, ya que la aplicación está orientada a usuarios administrativos autorizados. Por tanto, las solicitudes y documentos son gestionados desde el área correspondiente y no mediante autoservicio estudiantil.

Finalmente, algunos procesos académicos pueden variar según la facultad, carrera o normativa interna vigente, por lo que el sistema podría requerir ajustes futuros para adaptarse a nuevas disposiciones institucionales o cambios en los procedimientos administrativos.

## 6.4 Trabajos futuros

Como trabajo futuro, se recomienda implementar el sistema en un servidor institucional, configurando un entorno de producción que permita el acceso controlado desde la red de la universidad o desde los puntos autorizados por la institución.

También se considera conveniente integrar el sistema con plataformas académicas existentes, con el propósito de reducir el ingreso manual de información y mejorar la sincronización de datos relacionados con estudiantes, carreras, materias y planes de estudio.

Otra mejora importante consiste en incorporar mecanismos de firma digital o aprobación electrónica, especialmente para documentos que requieren validación por parte de autoridades académicas. Esto permitiría agilizar procesos que actualmente dependen de firmas físicas o circulación manual de documentos.

Se recomienda ampliar el módulo de informes mediante indicadores estadísticos adicionales, exportación de datos y gráficos comparativos por facultad, carrera, ciclo académico o tipo de trámite. Esto fortalecería el uso del sistema como herramienta de análisis y apoyo a la toma de decisiones.

Asimismo, podría incorporarse un sistema de notificaciones por correo electrónico para informar a los usuarios sobre documentos creados, modificaciones realizadas, procesos pendientes o cambios de estado.

También se propone fortalecer la auditoría del sistema mediante reportes detallados de actividad por usuario, fecha, módulo y acción realizada. Esto permitiría mejorar el seguimiento administrativo y la trazabilidad de los cambios efectuados dentro de la plataforma.

Finalmente, se recomienda optimizar la experiencia de usuario para dispositivos móviles, de manera que el sistema pueda consultarse y utilizarse de forma adecuada desde diferentes tamaños de pantalla.

## 6.5 Recomendaciones técnicas

Se recomienda mantener una política de respaldos periódicos de la base de datos, con el objetivo de prevenir pérdida de información ante fallos técnicos, errores humanos o problemas de infraestructura.

Es importante definir responsables administrativos para la gestión de usuarios, roles y permisos, evitando que cuentas no autorizadas permanezcan activas dentro del sistema.

Se sugiere utilizar contraseñas seguras y evitar el uso de credenciales compartidas, ya que cada acción realizada dentro del sistema debe poder asociarse a un usuario específico.

Antes de realizar cambios en producción, se recomienda probar las actualizaciones en un entorno de pruebas, verificando que los módulos principales continúen funcionando correctamente.

También se recomienda mantener actualizadas las dependencias del frontend y backend, considerando revisiones periódicas de seguridad y compatibilidad.

La documentación técnica del sistema debe mantenerse actualizada cada vez que se incorporen nuevas funciones, cambios en la base de datos o modificaciones en los flujos de trabajo.

## 6.6 Recomendaciones académicas e institucionales

Se recomienda capacitar a los usuarios antes de utilizar el sistema de manera oficial, explicando el funcionamiento de cada módulo, los campos obligatorios, la generación de documentos y la consulta de reportes.

La institución debería establecer lineamientos claros sobre el uso del sistema, especialmente en relación con quiénes pueden crear, modificar, imprimir o consultar documentos académicos.

Se recomienda revisar periódicamente los catálogos de carreras, materias, facultades y usuarios, con el fin de mantener la información actualizada y evitar inconsistencias en los registros.

También es conveniente promover el uso del módulo de informes como herramienta de seguimiento institucional, ya que los gráficos y reportes históricos permiten identificar tendencias, cargas de trabajo y comportamiento de los procesos académicos.

Finalmente, se recomienda considerar esta aplicación como una base inicial para futuros procesos de transformación digital dentro de la Universidad de Sonsonate, debido a que su estructura puede ampliarse para incorporar nuevos módulos o integrarse con otros sistemas institucionales.

## 6.7 Cierre del capítulo

El proyecto desarrollado evidencia la importancia de aplicar soluciones tecnológicas a los procesos de coordinación académica. La aplicación web propuesta permite organizar información, reducir la dispersión de documentos, mejorar la trazabilidad de los registros y facilitar la generación de informes. Aunque existen oportunidades de mejora e integración futura, el sistema representa un avance significativo hacia la digitalización de procesos administrativos dentro de la Universidad de Sonsonate.

En conclusión, la solución desarrollada cumple con el propósito de apoyar las actividades de coordinación de carreras mediante una plataforma web estructurada, funcional y adaptable, capaz de contribuir a una gestión académica más ordenada, segura y eficiente.
