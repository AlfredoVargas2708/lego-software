
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/home",
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-EGPFVVIM.js",
      "chunk-4O3FVBGX.js"
    ],
    "route": "/home"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 5282, hash: 'aeb1f6929c49b93d595e8493c31a5fc87aece94504b914e8a9d7602700636546', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1111, hash: '315500cdc8d6355b6aba13875fff47f41cad1144429af301e2d7c00e6bcf35ad', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'home/index.html': {size: 156618, hash: 'abe813fd9f646bb4dc0de87248167224a6dcd276817c5bb30995d6ee925fc855', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'styles-FRQQ4J6S.css': {size: 244169, hash: 'snHz40dNO3s', text: () => import('./assets-chunks/styles-FRQQ4J6S_css.mjs').then(m => m.default)}
  },
};
