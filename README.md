# 🏠 Off-Plan Vastgoed Platform

**Professioneel investeringsplatform voor off-plan vastgoed in Spanje met AI-gestuurde matching.**

[![Netlify Status](https://i.ytimg.com/vi/rQ2Ix-7sNKA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB70sr1eePncgdGEv_CirD4fUMNmQ)

🌐 **Live Site**: [spanje-rendement.nl](https://spanje-rendement.nl)

---

## 📋 Overzicht

Een modern, serverless platform voor off-plan vastgoed investeerders en ontwikkelaars. Maakt gebruik van AI-technologie (DeepSeek) om investeerders te matchen met geschikte projecten op basis van hun investeringsprofiel.

### ✨ Kernfunctionaliteiten

- **🔐 Authenticatie**: Veilige JWT-gebaseerde gebruikersauthenticatie
- **📊 Project Browser**: Bekijk en filter off-plan vastgoedprojecten
- **⭐ Favorieten**: Sla interessante projecten op
- **👤 Investeerdersprofiel**: Stel investeringsvoorkeuren en budget in
- **🤖 AI Matching**: Intelligente matching tussen investeerders en projecten
- **📈 Admin Dashboard**: Statistieken en beheer voor administrators
- **💾 Netlify Blobs**: Moderne, serverless data persistentie

---

## 🛠️ Technologie Stack

### Frontend
- **React 18** (via CDN)
- **TailwindCSS** voor styling
- **Single Page Application** (SPA)

### Backend
- **Netlify Serverless Functions**
- **Node.js 18+** (ES Modules)
- **JWT** voor authenticatie
- **Netlify Blobs** voor data opslag

### AI Integration
- **DeepSeek API** voor investeerder-project matching

---

## 🚀 Snelle Start

### Vereisten

- Node.js 18 of hoger
- Netlify account (Pro tier voor Blobs)
- DeepSeek API key

### Lokale Ontwikkeling

```bash
# Clone repository
git clone https://github.com/Jali2587/off-plan-vastgoed-deep-seek.git
cd off-plan-vastgoed-deep-seek

# Install dependencies
npm install

# Install Netlify CLI (globaal)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your Netlify site
netlify link

# Set environment variables locally
netlify env:set JWT_SECRET "your-secret-key"
netlify env:set DEEPSEEK_API_KEY "your-api-key"

# Start dev server
netlify dev
```

De applicatie draait nu op `http://localhost:8888`

---

## 📦 Deployment

### Automatische Deployment

De applicatie wordt automatisch gedeployed naar Netlify bij elke push naar de main branch.

### Handmatige Deployment

```bash
# Deploy naar productie
netlify deploy --prod
```

### Volledige Deployment Guide

Zie [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) voor een uitgebreide deployment handleiding inclusief:

- Environment variables configuratie
- Domain setup (spanje-rendement.nl)
- Data migratie
- Testing checklist
- Troubleshooting

---

## 🔐 Environment Variables

Vereiste environment variables (in Netlify Dashboard):

| Variable | Beschrijving | Voorbeeld |
|----------|--------------|----------|
| `JWT_SECRET` | Secret key voor JWT signing | `Xk7mP9qR2t...` |
| `DEEPSEEK_API_KEY` | DeepSeek API sleutel | `sk-123456...` |
| `NODE_VERSION` | Node.js versie | `18` |

**Genereer JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

## 📁 Project Structuur

```
off-plan-vastgoed-deep-seek/
├── index.html                 # Main SPA file (React app)
├── package.json               # Dependencies
├── netlify.toml              # Netlify configuration
├── DEPLOYMENT_GUIDE.md       # Deployment handleiding
├── data/                     # Initial data (JSON)
│   ├── projects.json
│   ├── users.json
│   ├── profiles.json
│   ├── favorites.json
│   └── reservations.json
└── netlify/
    └── functions/            # Serverless functions
        ├── lib/
        │   └── helpers.js    # Shared utilities (Netlify Blobs)
        ├── auth-login.js
        ├── auth-register.js
        ├── auth-verify.js
        ├── favorites-save.js
        ├── favorites-load.js
        ├── investor-profile-save.js
        ├── investor-profile-load.js
        ├── ai-match.js
        ├── admin-users-list.js
        ├── admin-profile-list.js
        ├── admin-reservations-list.js
        ├── admin-delete-project.js
        ├── admin-investor-stats.js
        └── admin-project-stats.js
```

---

## 🔌 API Endpoints

### Authenticatie

- `POST /auth-register` - Registreer nieuwe gebruiker
- `POST /auth-login` - Login bestaande gebruiker
- `GET /auth-verify` - Verifieer JWT token

### Gebruiker Functies

- `POST /favorites-save` - Sla favoriet project op
- `GET /favorites-load` - Laad gebruiker favorieten
- `POST /investor-profile-save` - Sla investeerdersprofiel op
- `GET /investor-profile-load` - Laad investeerdersprofiel

### AI Matching

- `POST /ai-match` - Match investeerder met projecten

### Admin Functies (vereist admin role)

- `GET /admin-users-list` - Lijst alle gebruikers
- `GET /admin-profile-list` - Lijst alle profielen
- `GET /admin-reservations-list` - Lijst alle reserveringen
- `GET /admin-investor-stats` - Investeerder statistieken
- `GET /admin-project-stats` - Project statistieken
- `POST /admin-delete-project` - Verwijder project

---

## 🔒 Beveiliging

### Geïmplementeerde Security Features

- ✅ **JWT Authentication** met 7-dagen expiratie
- ✅ **Content Security Policy** (CSP) headers
- ✅ **X-Frame-Options** (clickjacking bescherming)
- ✅ **HTTPS enforced** via Netlify
- ✅ **HSTS** (Strict Transport Security)
- ✅ **Input validatie** op alle endpoints
- ✅ **Role-based access control** (user/admin)
- ✅ **Secure token storage** (localStorage met HTTPOnly future upgrade pad)

---

## 🧪 Testing

### Test API Endpoints

```bash
# Test registratie
curl -X POST https://spanje-rendement.nl/.netlify/functions/auth-register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","role":"investor"}'

# Test login
curl -X POST https://spanje-rendement.nl/.netlify/functions/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test protected endpoint
curl https://spanje-rendement.nl/.netlify/functions/favorites-load \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Browser Testing

Open browser console en run:

```javascript
// Test API
async function testAPI() {
  const res = await fetch('/.netlify/functions/auth-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', role: 'investor' })
  });
  const data = await res.json();
  console.log('Token:', data.token);
}

testAPI();
```

---

## 📊 Data Persistentie

### Netlify Blobs

De applicatie gebruikt **Netlify Blobs** voor serverless data opslag:

- **Voordelen**:
  - ✅ Serverless (geen database server nodig)
  - ✅ Automatische scaling
  - ✅ Geen file system dependencies
  - ✅ Built-in Netlify integratie

- **Data Files** (opgeslagen als Blobs):
  - `data/users.json` - Gebruikersaccounts
  - `data/projects.json` - Vastgoedprojecten
  - `data/profiles.json` - Investeerdersprofielen
  - `data/favorites.json` - Favoriete projecten
  - `data/reservations.json` - Reserveringen

### Backup & Restore

```bash
# Backup all data
netlify blobs:get data/users.json > backup/users.json
netlify blobs:get data/projects.json > backup/projects.json

# Restore data
netlify blobs:set data/users.json --input backup/users.json
```

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally: `netlify dev`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request
6. Netlify creates deploy preview automatically
7. Review en merge naar main
8. Automatic production deployment

---

## 📝 Changelog

### Version 1.0.0 (December 2024)

**🎉 Initial Production Release**

**✨ Features**
- JWT authenticatie systeem
- Investeerdersprofiel management
- AI-powered project matching
- Admin dashboard
- Netlify Blobs integratie

**🔒 Security**
- Comprehensive security headers
- Input validatie
- Role-based access control

**📚 Documentation**
- Complete deployment guide
- API documentation
- Testing procedures

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Jali2587/off-plan-vastgoed-deep-seek/issues)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Netlify Support**: Pro tier support

---

## 📄 Licentie

**Proprietary** - © 2024 Spanje Rendement. Alle rechten voorbehouden.

---

## 🙏 Acknowledgments

- **Netlify** - Serverless hosting & Blobs storage
- **DeepSeek** - AI matching technology
- **React** - Frontend framework
- **TailwindCSS** - Utility-first CSS

---

**Gemaakt met ❤️ voor vastgoedinvesteerders**
