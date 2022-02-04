# Vite Plugin Capacitor

## Usage

```ts
// vite.config.js
import ViteCapacitor from 'vite-plugin-capacitor'

export default defineConfig({
    plugins: [
        // ...
        ViteCapacitor({
            pwaElementsVersion: 3,
            silent: false
        })
        // ...
    ]
})
```