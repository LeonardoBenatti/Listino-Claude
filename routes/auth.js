/**
 * routes/auth.js — Rotte di autenticazione
 *
 * Gestisce login e logout degli utenti.
 * Le credenziali vengono lette dal file data/users.csv.
 */

const express = require('express');
const router = express.Router();
const readCSV = require('../utils/csvReader');

/**
 * GET / — Mostra la pagina di login
 * Se l'utente è già autenticato, reindirizza direttamente al listino.
 */
router.get('/', (req, res) => {
    // Se già autenticato, vai dritto al listino
    if (req.session && req.session.authenticated) {
        return res.redirect('/listino');
    }
    // Mostra la pagina login (senza errori la prima volta)
    res.render('login', { error: null });
});

/**
 * POST /login — Gestisce il tentativo di login
 * Valida username e password contro il file CSV degli utenti.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validazione: campi obbligatori
    if (!username || !password) {
        return res.render('login', {
            error: 'Inserisci username e password.'
        });
    }

    try {
        // Legge gli utenti dal file CSV
        const utenti = await readCSV('data/users.csv');

        // Cerca corrispondenza username e password
        const utente = utenti.find(u =>
            u.username === username && u.password === password
        );

        if (utente) {
            // Login riuscito: imposta la sessione
            req.session.authenticated = true;
            req.session.username = username;
            return res.redirect('/listino');
        }

        // Credenziali errate
        return res.render('login', {
            error: 'Credenziali non valide. Riprova.'
        });
    } catch (err) {
        console.error('Errore durante il login:', err.message);
        return res.render('login', {
            error: 'Errore interno. Riprova più tardi.'
        });
    }
});

/**
 * GET /logout — Distrugge la sessione e reindirizza al login
 */
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
