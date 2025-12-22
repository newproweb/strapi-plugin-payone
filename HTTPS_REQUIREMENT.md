# Apple Pay HTTPS Requirement

## Muammo

Agar quyidagi xatoni ko'rsangiz:

```
InvalidAccessError: Trying to start an Apple Pay session from an insecure document.
```

Bu xato Apple Pay **faqat HTTPS** orqali ishlaydi degan ma'noni anglatadi.

## Yechim

### QADAM 1: HTTPS ga O'tish

Apple Pay ishlashi uchun saytingiz **HTTPS** orqali ishlashi kerak:

1. **Development (Localhost):**
   - `http://localhost` - ✅ Ishlaydi (localhost maxsus ruxsatga ega)
   - `http://127.0.0.1` - ✅ Ishlaydi
   - `https://localhost` - ✅ Ishlaydi

2. **Production:**
   - `http://yourdomain.com` - ❌ Ishlamaydi
   - `https://yourdomain.com` - ✅ Ishlaydi

### QADAM 2: SSL Sertifikati O'rnatish

Production muhitda SSL sertifikati o'rnatish:

**Let's Encrypt (Bepul):**
```bash
# Certbot yuklab oling
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikati oling
sudo certbot --nginx -d yourdomain.com
```

**Yoki Cloudflare orqali:**
1. Cloudflare ga kiring
2. SSL/TLS > Overview
3. "Full" yoki "Full (strict)" ni tanlang

### QADAM 3: Strapi Server Config

`config/server.js` yoki environment variables:

```javascript
// Production
module.exports = {
  url: 'https://yourdomain.com',
  // ...
};
```

```bash
# .env
SERVER_URL=https://yourdomain.com
```

### QADAM 4: Reverse Proxy (Nginx)

Agar Nginx ishlatilsa:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # HTTP dan HTTPS ga redirect
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Payment Request API

**Muhim:** Payment Request API HTTP da ham ishlaydi, lekin Apple Pay payment method uchun HTTPS kerak.

Agar siz HTTP da ishlatsangiz:
- ❌ Apple Pay JS API ishlamaydi
- ❌ Payment Request API da Apple Pay ishlamaydi
- ✅ Boshqa payment methodlar (Google Pay, Credit Card) ishlashi mumkin

## Test Qilish

1. **Localhost da:**
   ```bash
   # HTTP da ishlaydi (localhost maxsus ruxsatga ega)
   http://localhost:1337
   ```

2. **Production da:**
   ```bash
   # Faqat HTTPS da ishlaydi
   https://yourdomain.com
   ```

## Xatolarni Tekshirish

Browser console da quyidagi loglarni ko'rasiz:

```javascript
[Apple Pay] Secure context check: {
  protocol: "http:",
  hostname: "yourdomain.com",
  isSecure: false
}
```

Agar `isSecure: false` bo'lsa va `protocol: "http:"` bo'lsa, HTTPS ga o'tishingiz kerak.

## Qo'shimcha Ma'lumotlar

- [Apple Pay Web Requirements](https://developer.apple.com/documentation/applepayontheweb)
- [Payment Request API](https://developer.mozilla.org/en-US/docs/Web/API/Payment_Request_API)
- [Strapi Deployment](https://docs.strapi.io/dev-docs/deployment)

