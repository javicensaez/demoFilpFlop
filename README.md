# Logic Lab

Demos educativas: biestable RS con puertas NOR y NAND, y D sensible a nivel alto o bajo.

Abre `index.html` en un navegador y elige una demo. No necesita instalación ni compilación. También se puede alojar esta carpeta en cualquier servidor de archivos estáticos.

## Uso

1. Elige NOR (entradas activas a 1) o NAND (activas a 0, indicadas R̅ y S̅).
2. El estado inicial anterior a t = 0 es siempre Q = 0 (en RS, Q̅ = 1).
3. Pulsa cada tramo de Q y Q̅: el primer clic pone 1 y los siguientes alternan entre 0 y 1. Arrastra para extender el valor del primer tramo. Con teclado: Tab para moverte y Espacio para alternar.
4. Pulsa Comprobar. Los errores se indican con fondo rojo y una ×; puedes corregirlos y volver a comprobar.
5. Nuevo ejercicio genera otras entradas. Cambiar entre NOR y NAND conserva las señales R/S y el estado inicial, recalcula la solución y limpia las respuestas. Borrar conserva el ejercicio.

Los cambios suceden en segundos enteros. El valor de cada columna corresponde al intervalo [t, t + 1), después de aplicar las entradas en t. Se usa un modelo ideal sin retardos. Se incluyen las combinaciones prohibidas: NOR 11 fuerza Q = Q̅ = 0; NAND 00 fuerza Q = Q̅ = 1. Al pasar directamente a memoria, ambas salidas se representan con X (indeterminadas) hasta un Set o Reset. Cada ejercicio incluye este caso. Activa el botón X para dibujar indeterminación; desactívalo para volver a alternar 1/0.

## Estructura para las siguientes demos

- `index.html`: índice de laboratorios.
- `rs.html`: demo RS con variantes NOR y NAND.
- `d.html`: demo D con variantes por nivel alto y bajo.
- `d-flanco.html`: demo D por flanco ascendente o descendente.
- `jk.html`: demo JK por flanco ascendente o descendente.
- `t.html`: demo T por flanco ascendente o descendente.
- `styles.css`: diseño adaptable y componentes compartidos.
- `logic.js`: motor de cálculo sin dependencia del DOM y generador RS.
- `app.js`: controles, edición del cronograma y evaluación.

La demo `d.html` muestra y evalúa únicamente Q (12 tramos), sin Q̅ en su tabla ni cronograma. Usa el mismo motor e interfaz: D sigue a la entrada mientras EN está en el nivel activo y mantiene Q durante el inactivo. El selector de nivel conserva D, EN y el estado inicial. Incluye Comprobar, Ver solución, dibujo por clic o arrastre y formato 16:9. Usa los enlaces superiores para cambiar entre RS y D por nivel.

La demo `d-flanco.html` captura D únicamente en el flanco seleccionado de CLK y mantiene Q entre capturas. Q y CLK son 0 antes de t = 0. El reloj tiene un período de 4 segundos; D cambia entre los flancos para evitar ambigüedad de muestreo. Cambiar de flanco conserva las entradas.

Las demos `jk.html` y `t.html` incluyen flanco ascendente y descendente, solo Q, estado inicial 0 y controles compartidos. JK aplica 00 memoria, 01 Reset, 10 Set y 11 conmutación; T conserva con 0 e invierte con 1. Las entradas permanecen estables en los flancos. Cambiar de flanco conserva todas las señales y recalcula la solución.

## Verificación

`node --test tests/logic.test.cjs`

Las fuentes de Google son opcionales; si no hay conexión se usan las fuentes del sistema.

## Proyección

En pantallas panorámicas se usa un lienzo común de 1600×900, escalado proporcionalmente al ancho y alto disponibles. El ajuste se recalcula al redimensionar o entrar en pantalla completa; no depende de una resolución física concreta. En pantallas más estrechas se mantiene la distribución adaptable con desplazamiento. `projection.js` gestiona este ajuste en el índice y todas las demos.
