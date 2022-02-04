import { writeFileSync, existsSync } from 'fs'
import {normalizePath} from 'vite';
import address from "address"

const pwaElementsScript = `<script
type="module"
src="https://unpkg.com/@ionic/pwa-elements@2/dist/ionicpwaelements/ionicpwaelements.esm.js"
></script>
<script
nomodule
src="https://unpkg.com/@ionic/pwa-elements@2/dist/ionicpwaelements/ionicpwaelements.js"
></script>`

const capacitorConfigFiles = [
  './ios/App/App/capacitor.config.json',
  './android/app/src/main/assets/capacitor.config.json'
]

/**
 * @param {object} [options] 
 * @param {number} [options.pwaElementsVersion=3]
 * @param {boolean} [options.silent=false]
 * 
 * @returns {import("vite").Plugin}
 */
export default function (options = { pwaElementsVersion: 3, silent: false }) {
  return {
    name: 'vite-plugin-capacitor',
    enforce: 'pre',
    apply(_config, { command, mode }) {
      return command === 'serve' && mode === 'capacitor'
    },
    configureServer(server) {
      server.httpServer.once('listening', () => {
        const capSync = spawnSync('npx', ['cap', 'sync']);
        if (!options.silent) {
          console.log(capSync.output.toString());
        }

        const { host, port, https } = server.config.server;
        const machine = typeof host !== 'string' ? address.ip() : host;
        for (const file of capacitorConfigFiles.map(normalizePath)) {
          if (!existsSync(file)) {
            options.silent || console.log('SKIP Updating capacitor config on IOS')
            continue
          }

          const cap = JSON.parse(
            readFileSync(file).toString()
          );
  
          cap.server = {
            ...(cap.server || {}),
            url: `http${https ? 's' : ''}://${machine}:${port}`,
            cleartext: true,
          };
  
          writeFileSync(
            file,
            JSON.stringify(cap, null, 2)
          );  
        }
      })
    },
    transformIndexHtml(html) {
      const findFor = '</script>'
      return html.replace(
        findFor,
        [
          findFor,
          pwaElementsScript
        ].join('\n')
      );
    }
  }
}