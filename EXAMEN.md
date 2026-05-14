# EXAMEN — Hugo Olza

## Reto
F12 — Test que documenta el contrato del endpoint de firma

## Tarea técnica

### Qué problema detecté
El describe block de `PATCH /api/deliverynote/:id/sign` en `tests/deliverynote.test.js` solo tenía 3 tests y sus nombres describían la implementación ("rechaza firmar un albarán ya firmado") en lugar del contrato ("devuelve 409 si el albarán ya estaba firmado"). Faltaban por completo los casos de error 400 por ausencia de fichero, 404 por id inexistente y 404 por aislamiento multi-tenant.

### Cómo lo arreglé
Reescribí el describe block con exactamente 5 tests, renombrando los existentes con nombres orientados al contrato y añadiendo los dos casos faltantes. El caso 409 crea el albarán con `signed: true` directamente en la base de datos en memoria antes de la petición — no mockea el controlador — para verificar que el comportamiento correcto persiste ante cambios futuros en la lógica. El caso multi-tenant crea dos compañías independientes con sus propios datos y verifica que el token de una compañía no puede firmar albaranes de la otra.

### Por qué mi solución es correcta
Los nombres de los tests documentan el contrato observable del endpoint (código de respuesta + condición de negocio) sin acoplarse a detalles de implementación. Siguen pasando tras cualquier refactor interno. El mock de `uploadImage`/`uploadPdf` ya estaba en el fichero a nivel de módulo, por lo que los tests no dependen de credenciales de Cloudinary y son reproducibles en cualquier entorno. Los 5 tests pasan con `npm test` y el total del fichero sube a 15 tests, todos verdes.

## Respuestas socráticas

### 1. 409 Conflict vs 422 Unprocessable Entity para albarán ya firmado

`409 Conflict` indica que la petición es válida y está bien formada, pero choca con el estado actual del recurso en el servidor. Eso es exactamente lo que ocurre aquí: la petición de firma es correcta (hay un fichero, el JWT es válido, el id existe), pero el albarán ya tiene `signed: true` en la base de datos. `422 Unprocessable Entity` se usa cuando la semántica de la entidad enviada no puede procesarse — típicamente errores de validación de los datos del cuerpo de la petición, no conflictos de estado. La diferencia semántica es relevante: 409 dice "conflicto con el estado del servidor", 422 dice "tus datos son incoherentes". Como el problema no está en los datos enviados sino en el estado persistido del albarán, 409 es el código correcto según RFC 9110.

### 2. Cambio de compañía después de autenticarse en el socket

En `socketAuthMiddleware`, cuando el JWT ya lleva `companyId` en el payload, la middleware no consulta la base de datos y usa directamente ese valor para asignar `socket.user.companyId`. Si un usuario cambia de compañía mediante `PATCH /api/user/company` después de haberse conectado por socket, su conexión seguirá emitiendo y recibiendo eventos de la compañía antigua hasta que el token expire (máximo 15 minutos en esta app). Es un comportamiento aceptable, no un bug de seguridad grave, por tres razones: los access tokens tienen vida corta, el trade-off es el estándar de sistemas JWT stateless (escalabilidad a cambio de revocación retardada), y en cualquier caso el usuario no puede leer datos de la nueva compañía hasta obtener un token nuevo. La solución real para casos críticos sería emitir un nuevo token inmediatamente tras el cambio de compañía y forzar una reconexión del socket.

### 3. Índice compuesto {company: 1, workDate: -1} vs {workDate: -1, company: 1}

La consulta de listado siempre aplica una condición de igualdad en `company` y ordena por `workDate` descendente. MongoDB recorre los índices de izquierda a derecha siguiendo la regla ESR (Equality, Sort, Range): los campos de igualdad deben ir primero. Con `{company: 1, workDate: -1}`, el motor acota primero el espacio de búsqueda al subconjunto de documentos de esa compañía (cardinalidad baja dentro del índice) y dentro de ese subconjunto los documentos ya están ordenados por fecha, por lo que no se necesita un SORT stage adicional en memoria. Con `{workDate: -1, company: 1}`, MongoDB debería escanear todos los documentos ordenados por fecha independientemente de la compañía y luego filtrar, lo que es ineficiente con múltiples tenants. El índice `{company: 1, workDate: -1}` convierte tanto el filtro como el sort en una operación de índice pura y elimina la ordenación en memoria.

### 4. Error al conectarse a Cloudinary real sin credenciales

Sin el mock de `uploadImage`, la SDK de Cloudinary lanzaría un error de autenticación (HTTP 401 de la API de Cloudinary) que no está capturado como `AppError` operacional, por lo que llegaría al `errorHandler` como un error genérico con `isOperational: false` y resultaría en un `500` con el mensaje "Ha ocurrido un error interno". Para distinguirlo en un test: un error operacional propio (por ejemplo, albarán no encontrado) devuelve un status específico (404, 409) con un mensaje de negocio legible; un error de Cloudinary sin tratar devuelve 500 con el mensaje genérico. La forma correcta de hacerlo testable sería envolver la llamada a Cloudinary en un try/catch y lanzar un `AppError.internal('Error al subir la firma a Cloudinary')` o un `AppError` 503, de modo que el test pueda verificar `expect(res.status).toBe(503)` y distinguir el error de infraestructura del error de negocio por su código HTTP.

### 5. 404 vs 403 para recurso de otro tenant

Devolver 404 cuando el recurso existe pero pertenece a otro tenant es la práctica correcta en sistemas multi-tenant. Si se devolviera 403 (Forbidden), se confirmaría implícitamente que ese ID existe en el sistema pero que el usuario no tiene permiso para accederlo — esto permite a un atacante enumerar IDs válidos de otras compañías probando distintos identificadores y observando si recibe 403 (existe, de otra compañía) o 404 (no existe). Con 404, desde el punto de vista del usuario autenticado el recurso simplemente no existe en su universo de datos, que es el modelo mental correcto en multi-tenant: los datos de otra compañía no deben ser visibles ni confirmados. Es el principio de no revelar información de recursos ajenos: eliminar esa señal reduce la superficie de ataque y hace que la enumeración de IDs no aporte información útil al atacante.

## Proceso
Tiempo total invertido: 1.5 horas
Herramientas usadas: VScode