# kintone-customization-template

## Bundle the source code into a single file

1. Run npm install in the top directory of this project.
2. Copy your source files under src > js
3. Add "Export" statement to your global variables.
4. Add "Import" statement to your code, which uses the global variables.
5. Run `npm run build:dev` in the top directory of this project.
6. The bundled file will be outputted to "dist" folder.
7. The build command is running with watch mode, so whenever you make changes on your source code, the bundled file is refreshed automatically.

## Install libraries into your code and bundle it

1. Delete aOn the  CDN library.
2. Run 'npm i ${library}' in the top directory of this project.
  ${library} is the name of the library you want to install.
  You can find the name on [npmjs.com](https://www.npmjs.com/).
3. Add "Import" statement to your code, which uses the library.
4. Run `npm run build:dev` in the top directory of this project.