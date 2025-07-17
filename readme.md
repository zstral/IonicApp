Configuración del Entorno
Para ejecutar y desarrollar esta aplicación, asegúrate de tener instalados los siguientes requisitos:

Node.js (v16 o superior recomendado)

npm (v8 o superior recomendado)

Ionic CLI (npm install -g @ionic/cli)

Android Studio (para pruebas en emuladores/dispositivos Android y firma de la aplicación)

Regeneración de Paquetes y Preparación para Plataformas Nativas
Para preparar la aplicación para su ejecución en plataformas nativas (Android, iOS) o para generar paquetes de distribución (.aab o .ipa), sigue estos pasos:

Construir la Aplicación Web para Producción:
Este comando compila tu código Angular/Ionic en archivos optimizados para su despliegue.

ionic build

Los archivos compilados se encontrarán en la carpeta www/.

Sincronizar con la Plataforma Nativa (Android/iOS):
Capacitor toma los archivos web generados en www/ y los copia a tu proyecto nativo (ej. android/app/src/main/assets/public). También sincroniza los plugins de Capacitor.

npx cap sync android
# Si también trabajas con iOS:
# npx cap sync ios

Importante: Debes ejecutar ionic build y luego npx cap sync [plataforma] cada vez que realices cambios significativos en el código de tu aplicación (HTML, CSS, TypeScript) que quieras ver reflejados en el proyecto nativo.

Abrir el Proyecto Nativo (Opcional, para depuración o firma):
Para abrir el proyecto en Android Studio (o Xcode para iOS):

npx cap open android
# npx cap open ios

Ejecución de Pruebas

1. Ejecutar Pruebas Unitarias (Jasmine)
Las pruebas unitarias validan componentes y servicios individuales de la aplicación.

Comando:

ng test

Descripción: Este comando iniciará Karma (el test runner de Angular) y ejecutará todas las pruebas definidas en los archivos .spec.ts. Los resultados se mostrarán en la terminal y, por defecto, en un navegador web.

2. Ejecutar Pruebas End-to-End (E2E) (Cypress)
Las pruebas E2E simulan la interacción de un usuario real con la aplicación completa, verificando los flujos de trabajo de principio a fin.

Asegúrate de que la aplicación esté en ejecución:
Las pruebas E2E necesitan que tu aplicación esté sirviéndose en un navegador.

ionic serve

Abrir Cypress Test Runner:
En una nueva terminal, ejecuta el siguiente comando para abrir la interfaz de Cypress. Desde aquí, podrás seleccionar y ejecutar tus pruebas E2E.

npx cypress open

Descripción: Cypress abrirá una ventana donde podrás ver tus especificaciones de prueba (.cy.ts). Al hacer clic en una, Cypress lanzará un navegador y ejecutará la prueba, mostrando los pasos y el estado en tiempo real. Para estas pruebas, se utiliza un mock en memoria para simular la base de datos SQLite garantizando un entorno de prueba consistente y rápido.