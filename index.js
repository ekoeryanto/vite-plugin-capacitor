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
    apply(config, env) {
      return (
        Boolean(config.server?.host) &&
        env.command === 'serve' &&
        config.mode === 'capacitor'
      );
    },
    configureServer(server) {
      const { logger } = server.config;

      server.httpServer.once('listening', () => {
        const { host, port, https } = server.config.server;
        const machine = typeof host !== 'string' ? address.ip() : host;
        const url = `http${https ? 's' : ''}://${machine}:${port}`;
        process.env.VITE_CAPACITOR_URL = url;
        const jsonFile = normalizePath('capacitor.config.json');
        if (existsSync(jsonFile)) {
          const json = JSON.parse(readFileSync(jsonFile, 'utf-8'))
          json.server = {
            ...(json.server || {}),
            url,
            cleartext: true,
          };
          writeFileSync(jsonFile, JSON.stringify(json, null, 2))
        }
        logger.info(`Capacitor URL is ${url}`);
        const capSync = spawnSync('npx', ['cap', 'sync']);
        logger.info(capSync.output.toString());
      })
    },
    transformIndexHtml(html) {
      if (!pwaElementsVersion) return html
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
