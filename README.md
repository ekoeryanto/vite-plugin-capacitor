# Vite Plugin Capacitor

## Usage

- vite.config.js

```ts
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

- capacitor.config.ts

```ts
{
  // ...
  server: {
    url: process.env.VITE_CAPACITOR_URL,
    cleartext: Boolean(process.env.VITE_CAPACITOR_URL),
  },
  // ...
}

- package.json

```bash
// serve with npm run capacitor
{
  // ...
  "scripts": {
    // ...
    "capacitor": "vite --host --mode=capacitor",
    // ...
  },
  // ...
}
```
