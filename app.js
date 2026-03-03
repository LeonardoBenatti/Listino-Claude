/**
 * app.js — Entry point dell'applicazione Listino
 *
 * Configura Express, middleware, sessione e rotte.
 * Avvia il server sulla porta specificata in .env (default: 3000).
 */

// Carica le variabili d'ambiente dal file .env
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// Configurazione Template Engine (EJS)
// ─────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

// Parsing del body delle richieste POST (form data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// File statici (CSS, immagini, ecc.)
app.use(express.static(path.join(__dirname, 'public')));

// Configurazione sessione
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // 2 ore
        httpOnly: true
    }
}));

// ─────────────────────────────────────────────
// Rotte
// ─────────────────────────────────────────────

// Rotte di autenticazione (/, /login, /logout)
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// Rotta protetta del listino (/listino)
const listinoRoutes = require('./routes/listino');
app.use('/listino', listinoRoutes);

// ─────────────────────────────────────────────
// Gestione errori 404
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).send(`
    <div style="text-align:center; margin-top:100px; font-family:-apple-system,sans-serif;">
      <h1 style="font-size:72px; color:#d2d2d7; margin:0;">404</h1>
      <p style="color:#86868b; font-size:18px;">Pagina non trovata</p>
      <a href="/" style="color:#0071e3; text-decoration:none;">Torna al login</a>
    </div>
  `);
});

// ─────────────────────────────────────────────
// Avvio del server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✓ Server avviato su http://localhost:${PORT}`);
    console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
