# Content Security Policy (CSP) Setup for Apple Pay and Google Pay

## Muammo

Agar quyidagi xatolarni ko'rsangiz:

```
Loading the script 'https://pay.google.com/gp/p/js/pay.js' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'"
Loading the script 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline'"
```

Bu CSP (Content Security Policy) sozlamalari muammosi.

## Yechim

### QADAM 1: Admin Config yangilash

`config/admin.js` faylini yangilang:

```javascript
module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // Content Security Policy for Apple Pay and Google Pay
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://pay.google.com', // Google Pay SDK
        'https://applepay.cdn-apple.com', // Apple Pay SDK
        'https://www.apple.com', // Apple Pay manifest
      ],
      'script-src-elem': [
        "'self'",
        "'unsafe-inline'",
        'https://pay.google.com', // Google Pay SDK
        'https://applepay.cdn-apple.com', // Apple Pay SDK
      ],
      'connect-src': [
        "'self'",
        'https:',
        'https://pay.google.com', // Google Pay API
        'https://applepay.cdn-apple.com', // Apple Pay API
        'https://www.apple.com', // Apple Pay manifest
        'https://api.pay1.de', // Payone API
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      'media-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
      ],
      'frame-src': [
        "'self'",
        'https://pay.google.com', // Google Pay iframe
        'https://applepay.cdn-apple.com', // Apple Pay iframe
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https:',
      ],
    },
  },
});
```

### QADAM 2: Middlewares Config yangilash

`config/middlewares.js` faylini yangilang:

```javascript
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://pay.google.com', // Google Pay SDK
            'https://applepay.cdn-apple.com', // Apple Pay SDK
            'https://www.apple.com', // Apple Pay manifest
          ],
          'connect-src': [
            "'self'",
            'https:',
            'https://pay.google.com', // Google Pay API
            'https://applepay.cdn-apple.com', // Apple Pay API
            'https://www.apple.com', // Apple Pay manifest
            'https://api.pay1.de', // Payone API
          ],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https:',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'https:',
          ],
          'frame-src': [
            "'self'",
            'https://pay.google.com', // Google Pay iframe
            'https://applepay.cdn-apple.com', // Apple Pay iframe
          ],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### QADAM 3: Serverni Qayta Ishga Tushirish

Config fayllarini yangilaganingizdan so'ng:

```bash
# Development
npm run develop

# Production
npm run build
npm start
```

## Tekshirish

1. Browser console ni oching (F12)
2. Network tab ni oching
3. Apple Pay yoki Google Pay tugmasini bosing
4. Quyidagi scriptlar yuklanishi kerak:
   - `https://pay.google.com/gp/p/js/pay.js` (Google Pay)
   - `https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js` (Apple Pay)

Agar hali ham xatolar bo'lsa:
1. Browser cache ni tozalang
2. Hard refresh qiling (Ctrl+Shift+R yoki Cmd+Shift+R)
3. Server loglarini tekshiring

## Qo'shimcha Ma'lumotlar

- [Strapi Security Documentation](https://docs.strapi.io/dev-docs/configurations/middlewares#security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Apple Pay Web Documentation](https://developer.apple.com/documentation/applepayontheweb)


