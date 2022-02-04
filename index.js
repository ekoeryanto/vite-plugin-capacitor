const { readFileSync, writeFileSync, existsSync } = require('fs')
const { spawnSync } = require('child_process')
const {normalizePath} = require('vite')
const address = require("address")

module.exports = ViteCapacitor

const pwaElementsScript = `<script
type="module"
src="https://unpkg.com/@ionic/pwa-elements@3/dist/ionicpwaelements/ionicpwaelements.esm.js"
></script>
<script
nomodule
src="https://unpkg.com/@ionic/pwa-elements@3/dist/ionicpwaelements/ionicpwaelements.js"
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
function ViteCapacitor (options = { pwaElementsVersion: 3, silent: false }) {
  return {
    name: 'vite-plugin-capacitor',
    enforce: 'pre',
    apply(_config, { command, mode }) {
      return mode === 'capacitor'
    },
    configureServer(server) {
      server.httpServer.once('listening', () => {
        const capSync = spawnSync('npx', ['cap', 'sync']);
        console.log(capSync.output.toString());
        
        if (server.config.command === 'build') return

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
          pwaElementsScript.replace(/@3/g, `@${options.pwaElementsVersion}`)
        ].join('\n')
      );
    }
  }
}