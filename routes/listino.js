/**
 * routes/listino.js — Rotta per la pagina Listino
 *
 * Legge i dati dal file CSV e li passa alla vista EJS.
 * Protetta dal middleware di autenticazione.
 */

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const readCSV = require('../utils/csvReader');

/**
 * GET /listino — Pagina principale del listino
 * Protetta: richiede autenticazione.
 * Legge i dati dal CSV ad ogni richiesta (così basta aggiornare il file
 * per vedere le modifiche senza riavviare il server).
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        // Legge i dati dal CSV (path relativo alla root del progetto)
        const dati = await readCSV('data/listino.csv');

        // Render della pagina con i dati
        res.render('listino', {
            dati: dati,
            username: req.session.username
        });
    } catch (err) {
        console.error('Errore nel caricamento dei dati:', err.message);
        res.render('listino', {
            dati: [],
            username: req.session.username,
            error: 'Impossibile caricare i dati dal CSV.'
        });
    }
});

module.exports = router;
