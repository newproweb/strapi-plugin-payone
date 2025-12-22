# Apple Pay Integration Setup Guide - Payone Plugin

## Kirish

Bu qo'llanma Apple Pay ni Payone orqali integratsiya qilish uchun **qadama-qadam** ko'rsatma beradi. 

**Muhim:** Bu usulda Apple Developer hisobiga ega bo'lish **shart emas**, chunki Payone merchant validationni o'zi boshqaradi. Biroq, quyidagi qadamlarni **to'liq** bajarish kerak.

## Umumiy ko'rinish

Payone orqali Apple Pay integratsiyasi quyidagi afzalliklarga ega:
- ✅ Apple Developer hisobiga ega bo'lish shart emas
- ✅ Payone merchant validationni boshqaradi
- ✅ To'liq konfiguratsiya qilinadigan
- ✅ Test va Live muhitlar uchun qo'llab-quvvatlanadi

## Qadama-qadam Setup

### QADAM 1: Domain Verification (Domain Tasdiqlash)

#### 1.1. Domain Verification Faylini Olish

**Payone dan fayl yuklab olish:**

1. Payone PMI (Payment Method Integration) ga kiring
2. **KONFIGURATSIYA** > **PLATYEZHNYE PORTALY** ga o'ting
3. Portal ni tanlang
4. Apple Pay bo'limida **"Domain Verification File"** ni yuklab oling

Yoki Payone support ga murojaat qiling va domain verification faylini so'rang.

**Fayl nomi:** `apple-developer-merchantid-domain-association`

#### 1.2. Fayl Joylashuvi

**Muhim:** Fayl quyidagi path da bo'lishi kerak:

```
/.well-known/apple-developer-merchantid-domain-association
```

**To'liq URL misol:**
```
https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
```

#### 1.3. Strapi da Fayl Qo'yish

**Variant 1: Public papkada (Tavsiya etiladi)**

1. Strapi project root da `public` papkasini yarating (agar yo'q bo'lsa)
2. `public/.well-known/` papkasini yarating
3. `apple-developer-merchantid-domain-association` faylini qo'ying

**Struktura:**
```
your-strapi-project/
├── public/
│   └── .well-known/
│       └── apple-developer-merchantid-domain-association
```

**Variant 2: Static Files Middleware**

Agar Strapi da static files middleware ishlatilsa, faylni static files papkasiga qo'ying.

#### 1.4. Fayl Sozlamalari

Fayl quyidagi talablarga javob berishi kerak:

- ✅ **MIME Type:** `text/plain` yoki `application/json`
- ✅ **Access:** Fayl **public** bo'lishi kerak (authentication talab qilmasligi kerak)
- ✅ **Path:** To'g'ri path da bo'lishi kerak (`/.well-known/apple-developer-merchantid-domain-association`)
- ✅ **SSL:** Domen SSL sertifikatiga ega bo'lishi kerak (HTTPS)

#### 1.5. Domain Verification Test

Fayl to'g'ri qo'yilganligini tekshirish:

1. Browser da quyidagi URL ni oching:
   ```
   https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
   ```

2. **Kutilayotgan natija:**
   - ✅ Fayl yuklanishi va ko'rinishi kerak
   - ✅ Fayl ichida text content bo'lishi kerak
   - ❌ 404 xatosi ko'rsatilmasligi kerak
   - ❌ Authentication so'ralmasligi kerak

3. **Agar 404 xatosi ko'rsatilsa:**
   - Fayl path ni tekshiring
   - Server sozlamalarini tekshiring
   - Static files middleware sozlamalarini tekshiring

4. **Agar authentication talab qilinsa:**
   - Fayl public bo'lishi kerak
   - Server sozlamalarida authentication ni o'chiring
   - `.well-known` papkasi uchun public access ni ta'minlang

### QADAM 2: Server va Web Page Sozlamalari

#### 2.1. SSL Sertifikati

**Muhim talablar:**

1. **SSL Sertifikati mavjud bo'lishi kerak:**
   - Apple Pay faqat HTTPS orqali ishlaydi
   - HTTP da ishlamaydi

2. **SSL Sertifikati amal qilishi kerak:**
   - Sertifikat muddati tugamagan bo'lishi kerak
   - Sertifikat domen uchun to'g'ri bo'lishi kerak

3. **SSL Sertifikati yangilanishi:**
   - ⚠️ **Muhim:** SSL sertifikati muddati tugashidan **7 kun oldin** yangilanishi kerak
   - Agar 7 kun ichida yangilanmasa, Apple Pay ishlamay qoladi
   - Bu holatda Payone support ga murojaat qilishingiz kerak

**SSL Sertifikati tekshirish:**

```bash
# SSL sertifikati muddatini tekshirish
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

#### 2.2. Apple IP Addresslariga Ruxsat

Serveringiz Apple IP addresslaridan keladigan so'rovlarni qabul qilishi kerak.

**Apple IP Address Ranges:**

- `17.0.0.0/8` - Apple network range
- `17.172.224.0/19` - Apple Pay servers

**Firewall Sozlamalari:**

1. Serveringizda firewall sozlamalarini tekshiring
2. Apple IP addresslariga ruxsat bering
3. Agar Cloudflare yoki boshqa CDN ishlatilsa, Apple IP addresslariga ruxsat bering

**Nginx misol:**

```nginx
# Allow Apple IP addresses
allow 17.0.0.0/8;
allow 17.172.224.0/19;
```

**Apache misol:**

```apache
# Allow Apple IP addresses
<RequireAll>
    Require ip 17.0.0.0/8
    Require ip 17.172.224.0/19
</RequireAll>
```

#### 2.3. Server Konfiguratsiyasi

**Strapi Server Config:**

`config/server.js` yoki `config/env/production/server.js`:

```javascript
module.exports = {
  host: '0.0.0.0',
  port: process.env.PORT || 1337,
  url: process.env.SERVER_URL || 'https://yourdomain.com',
  proxy: true, // Agar reverse proxy ishlatilsa
  cron: {
    enabled: false
  }
};
```

**Environment Variables:**

```bash
SERVER_URL=https://yourdomain.com
PORT=1337
```

#### 2.4. Static Files Middleware

Agar `.well-known` papkasi ishlamasa, static files middleware sozlang:

`config/middlewares.js`:

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
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
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

### QADAM 3: Merchant Identifier Olish

#### 3.1. Payone Support ga Murojaat

Domain verification va server setup qadamlari bajarilgandan so'ng, Payone support ga murojaat qiling.

**Email yuborish:**

**To:** Payone support email (sizning mintaqangizga mos)

**Mavzu:** `Apple Pay Integration Request - Domain Verified`

**Email matni:**

```
Assalomu alaykum,

Men Apple Pay integratsiyasini sozlashni xohlayman.

Quyidagi ma'lumotlar:

1. Domain: yourdomain.com
2. MID (Merchant ID): [sizning MID]
3. Portal ID: [sizning Portal ID]
4. Domain Verification:
   - Fayl joylashuvi: https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
   - SSL sertifikati: Amal qilmoqda (muddati: [sana])
5. Server sozlamalari: Tayyor

Iltimos, Apple Pay uchun merchant identifier ni faollashtiring.

Rahmat.
```

#### 3.2. Payone dan Javob

Payone support sizga quyidagilarni beradi:

1. **Merchant Identifier** - Apple Pay uchun merchant identifier
2. **Konfiguratsiya ma'lumotlari** - Plugin sozlash uchun kerakli ma'lumotlar
3. **Test/Live muhit ma'lumotlari**

#### 3.3. PMI da Ko'rish

Merchant identifier ni Payone PMI da ko'rishingiz mumkin:

1. PMI ga kiring: https://pmi.pay1.de
2. **KONFIGURATSIYA** > **PLATYEZHNYE PORTALY** ga o'ting
3. Portal ni tanlang
4. **Konfiguratsiya tipov platezhey** tabiga o'ting
5. Apple Pay bo'limida **merchant identifier** ni ko'rasiz

**Merchant Identifier format:**
```
merchant.com.yourdomain
```

### QADAM 4: Plugin Konfiguratsiyasi

#### 4.1. Admin Panelida Sozlash

1. Strapi Admin Panel ga kiring
2. **Settings** > **Payone Provider** ga o'ting
3. **Configuration** tabiga o'ting

#### 4.2. Asosiy Sozlamalar

Quyidagi maydonlarni to'ldiring:

- **AID (Account ID):** Payone Account ID
- **Portal ID:** Payone Portal ID
- **MID (Merchant ID):** Payone Merchant ID
- **Key:** Payone API Key
- **Mode:** `test` yoki `live`
  - `test` - Test muhit
  - `live` - Live muhit
- **Merchant Name:** Store nomi (optional, lekin tavsiya etiladi)
- **Domain Name:** Domen nomi (optional, avtomatik aniqlanadi)
- **Merchant Identifier:** Payone dan olingan merchant identifier (optional)

#### 4.3. Apple Pay Konfiguratsiyasi

**Payment Actions** tabida:

1. **Payment Method:** "Apple Pay" ni tanlang
2. **Country Code:** Mamlakat kodi (masalan: DE, US, GB)
3. **Currency Code:** Valyuta kodi (masalan: EUR, USD, GBP)
4. **Supported Networks:** Qo'llab-quvvatlanadigan to'lov tarmoqlari
5. **Merchant Capabilities:** Merchant imkoniyatlari (3D Secure, Credit, Debit)

#### 4.4. Test Qilish

1. **Mode:** `test` ni tanlang
2. **Amount:** Test summa kiriting (masalan: 1000 = €10.00)
3. **Apple Pay** tugmasini bosing
4. Apple Pay dialog ochiladi
5. To'lovni tasdiqlang
6. Natijani tekshiring

## Test va Live Muhitlar

### Test Muhit

**Sozlamalar:**

- **Mode:** `test`
- **Test Merchant Identifier:** Payone dan olingan test merchant identifier
- **Test Cards:** Apple Pay sandbox test kartalari

**Test Kartalar:**

- **Visa:** 4111111111111111
- **Mastercard:** 5555555555554444
- **Amex:** 378282246310005
- **Discover:** 6011111111111117

**Test Qilish:**

1. Safari brauzerida (iOS, macOS, iPadOS)
2. Apple ID bilan tizimga kirish kerak
3. Test kartalar Apple Pay da qo'shilishi kerak
4. Sandbox muhitda test qilish

### Live Muhit

**Sozlamalar:**

- **Mode:** `live`
- **Live Merchant Identifier:** Payone dan olingan live merchant identifier
- **SSL Sertifikati:** Live domen uchun amal qiluvchi SSL sertifikati
- **Domain Verification:** Live domen uchun domain verification fayl qo'yilgan bo'lishi kerak

**Live Muhitga O'tish:**

1. Barcha testlar muvaffaqiyatli o'tganligini tekshiring
2. **Mode:** `live` ni tanlang
3. Live merchant identifier ni kiriting
4. SSL sertifikati amal qilayotganligini tekshiring
5. Domain verification fayl to'g'ri qo'yilganligini tekshiring
6. Birinchi to'lovni test qiling

## Debugging

### Server Loglari

Server tomonida quyidagi loglar ko'rinadi:

```
[Apple Pay] Initializing Apple Pay session with Payone
[Apple Pay] Settings loaded: { mode: 'test', mid: '...', portalid: '...' }
[Apple Pay] Sending request to Payone: { url: '...', mode: 'test', ... }
[Apple Pay] Payone response received: { status: 200, ... }
[Apple Pay] Session initialization response: { ... }
```

### Admin Loglari

Browser console da quyidagi loglar ko'rinadi:

```javascript
[Apple Pay] Button clicked, checking readiness...
[Apple Pay] Starting payment request: { amount: '10.00', currency: 'EUR', ... }
[Apple Pay] Merchant validation requested: { validationURL: '...', domain: '...' }
[Apple Pay] Validating merchant with Payone: { ... }
[Apple Pay] Payment token received: { hasToken: true, ... }
[Apple Pay] Payment completed successfully
```

### Muammolarni Hal Qilish

#### Domain Verification Muammolari

**Muammo:** Domain verification fayl topilmayapti (404)

**Yechim:**
1. Fayl path ni tekshiring: `/.well-known/apple-developer-merchantid-domain-association`
2. Fayl public bo'lishi kerak
3. Server sozlamalarini tekshiring
4. Static files middleware sozlamalarini tekshiring

**Muammo:** Domain verification fayl authentication talab qilmoqda

**Yechim:**
1. Fayl public bo'lishi kerak
2. Server sozlamalarida authentication ni o'chiring
3. `.well-known` papkasi uchun public access ni ta'minlang

#### SSL Sertifikati Muammolari

**Muammo:** SSL sertifikati muddati tugagan

**Yechim:**
1. SSL sertifikatini yangilang
2. 7 kun oldin yangilanishi kerak
3. Yangilangandan so'ng Payone support ga xabar bering

**Muammo:** SSL sertifikati noto'g'ri

**Yechim:**
1. SSL sertifikati domen uchun to'g'ri bo'lishi kerak
2. Wildcard yoki multi-domain sertifikat ishlatishingiz mumkin
3. Sertifikatni qayta o'rnating

#### Merchant Validation Muammolari

**Muammo:** Merchant validation xatosi

**Yechim:**
1. Merchant identifier ni tekshiring
2. Payone sozlamalarini tekshiring
3. Domain verification fayl to'g'ri qo'yilganligini tekshiring
4. Server loglarini tekshiring
5. Browser console da xatolarni ko'ring

#### Payment Token Muammolari

**Muammo:** Payment token olinmayapti

**Yechim:**
1. Browser console da xatolarni tekshiring
2. Payment Request API qo'llab-quvvatlanayotganini tekshiring
3. Apple Pay mavjudligini tekshiring
4. Network xatolarni tekshiring
5. Server loglarini tekshiring

## Qo'shimcha Ma'lumotlar

### Foydali Linklar

- [Payone Apple Pay Documentation](https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev)
- [Apple Pay Web Documentation](https://developer.apple.com/documentation/applepayontheweb)
- [Apple Pay Sandbox Testing](https://developer.apple.com/apple-pay/sandbox-testing/)
- [Apple Pay Button CSS](https://developer.apple.com/documentation/applepayontheweb/displaying-apple-pay-buttons-using-css)
- [Payment Request API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API)

### Support

Agar muammolar bo'lsa:
1. Payone support ga murojaat qiling
2. Plugin GitHub issues ga yozing
3. Strapi community ga murojaat qiling

## Xulosa

Apple Pay integratsiyasi to'liq sozlangan va ishga tayyor. Quyidagi qadamlarni bajarganingizdan so'ng, Apple Pay orqali to'lovlarni qabul qilish imkoniyatiga ega bo'lasiz:

1. ✅ Domain verification fayl qo'yilgan
2. ✅ SSL sertifikati amal qilmoqda
3. ✅ Merchant identifier olingan
4. ✅ Plugin sozlangan
5. ✅ Test muhitda sinab ko'rilgan
6. ✅ Live muhitga o'tkazilgan

**Muvaffaqiyatli integratsiya!**
