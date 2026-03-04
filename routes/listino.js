/**
 * routes/listino.js — Rotte per la pagina Listino e API dati
 *
 * Legge i dati dai file CSV e li passa alla vista EJS.
 * Fornisce API JSON per i dropdown a cascata.
 * Protetta dal middleware di autenticazione.
 */

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const readCSV = require('../utils/csvReader');

/**
 * GET /listino — Pagina principale del listino
 * Protetta: richiede autenticazione.
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        res.render('listino', {
            username: req.session.username
        });
    } catch (err) {
        console.error('Errore nel rendering del listino:', err.message);
        res.render('listino', {
            username: req.session.username,
            error: 'Errore nel caricamento della pagina.'
        });
    }
});

/**
 * GET /listino/api/filtri — Restituisce le opzioni per i dropdown a cascata
 *
 * Query params opzionali:
 *   - tipologia: filtra modelli disponibili per questa tipologia
 *   - modello: filtra produzioni disponibili per questo modello
 *
 * Restituisce: { tipologie: [...], modelli: [...], produzioni: [...] }
 */
router.get('/api/filtri', requireAuth, async (req, res) => {
    try {
        const dati = await readCSV('data/listino.csv');
        const { tipologia, modello } = req.query;

        // Normative disponibili (statiche: CE, UL, NR)
        const normative = ['CE', 'UL', 'NR'];

        // Tutte le tipologie uniche
        const tipologie = [...new Set(dati.map(r => r.Tipologia))].filter(Boolean).sort();

        // Modelli filtrati per tipologia (se specificata)
        let modelliFiltrati = dati;
        if (tipologia) {
            modelliFiltrati = dati.filter(r => r.Tipologia === tipologia);
        }
        const modelli = [...new Set(modelliFiltrati.map(r => r.Modello))].filter(Boolean).sort();

        // Produzioni filtrate per modello (se specificato)
        let produzioniFiltrate = modelliFiltrati;
        if (modello) {
            produzioniFiltrate = modelliFiltrati.filter(r => r.Modello === modello);
        }
        const produzioni = [...new Set(produzioniFiltrate.map(r => r.Produzione))]
            .filter(Boolean)
            .sort((a, b) => Number(a) - Number(b));

        res.json({ normative, tipologie, modelli, produzioni });
    } catch (err) {
        console.error('Errore API filtri:', err.message);
        res.status(500).json({ error: 'Errore nel caricamento dei filtri.' });
    }
});

/**
 * GET /listino/api/prodotto — Restituisce il dettaglio del prodotto selezionato
 *
 * Query params richiesti:
 *   - normativa: CE, UL o NR
 *   - tipologia
 *   - modello
 *   - produzione
 */
router.get('/api/prodotto', requireAuth, async (req, res) => {
    try {
        const dati = await readCSV('data/listino.csv');
        const { normativa, tipologia, modello, produzione } = req.query;

        if (!normativa || !tipologia || !modello || !produzione) {
            return res.status(400).json({ error: 'Tutti i parametri sono richiesti.' });
        }

        // Trova il prodotto corrispondente
        const prodotto = dati.find(r =>
            r.Tipologia === tipologia &&
            r.Modello === modello &&
            String(r.Produzione) === String(produzione)
        );

        if (!prodotto) {
            return res.status(404).json({ error: 'Prodotto non trovato.' });
        }

        // Seleziona i costi in base alla normativa
        const isUL = normativa === 'UL';
        const result = {
            // Info generali
            tipologia: prodotto.Tipologia,
            modello: prodotto.Modello,
            produzione: prodotto.Produzione,
            normativa: normativa,

            // Equipment (mostra solo quelli non vuoti)
            equipment: {},

            // Ore
            ore: {
                studiElettromeccanico: prodotto.OreSE || 0,
                studioSoftwarePLC: prodotto.OreSSP || 0,
                studioSoftwareHMI: prodotto.OreSSH || 0,
                costruzioneQuadro: prodotto.OreCQ || 0,
                collaudoElettromeccanico: prodotto.OreCIE || 0,
                collaudoSoftware: prodotto.OreCIS || 0,
            },

            // Costi (basati sulla normativa)
            costi: {
                manodopera: isUL
                    ? Number(prodotto.CostoManodoperaUL) || 0
                    : Number(prodotto.CostoManodoperaCE) || 0,
                materiali: isUL
                    ? Number(prodotto.CostoMaterialiUL) || 0
                    : Number(prodotto.CostoMaterialiCE) || 0,
                totale: isUL
                    ? Number(prodotto.CostoTotaleUL) || 0
                    : Number(prodotto.CostoTotaleCE) || 0,
            },

            dimensioni: prodotto.Dimensioni || '',
        };

        // Aggiungi equipment non vuoti
        const equipFields = {
            'Pressa': 'Pressa',
            'GruppoTaglio': 'Gruppo di Taglio',
            'Trabatto': 'Trabatto',
            'Elevatore': 'Elevatore',
            'Essiccatoio': 'Essiccatoio',
            'Raffreddatore': 'Raffreddatore',
            'Formatrice': 'Formatrice',
            'GruppoFormazione': 'Gruppo Formazione',
            'Cuocitore': 'Cuocitore',
            'Niditrice': 'Niditrice',
            'Telaio': 'Telaio',
        };

        Object.entries(equipFields).forEach(([key, label]) => {
            if (prodotto[key] && prodotto[key] !== '') {
                result.equipment[label] = prodotto[key];
            }
        });

        res.json(result);
    } catch (err) {
        console.error('Errore API prodotto:', err.message);
        res.status(500).json({ error: 'Errore nel caricamento del prodotto.' });
    }
});

/**
 * GET /listino/api/optionals — Restituisce gli opzionali per tipologia/modello
 *
 * Query params:
 *   - tipologia
 *   - modello
 *   - normativa (CE o UL, per i costi)
 */
router.get('/api/optionals', requireAuth, async (req, res) => {
    try {
        const dati = await readCSV('data/optionals.csv');
        const { tipologia, modello, normativa } = req.query;

        let filtrati = dati;
        if (tipologia) {
            filtrati = filtrati.filter(r => r.Tipologia === tipologia);
        }
        if (modello) {
            filtrati = filtrati.filter(r => r.Modello === modello);
        }

        const isUL = normativa === 'UL';

        const optionals = filtrati.map(r => ({
            id: r.ID,
            descrizione: r.Descrizione,
            ore: {
                studiElettromeccanico: r.OreSE || 0,
                studioSoftwarePLC: r.OreSSP || 0,
                studioSoftwareHMI: r.OreSSH || 0,
                costruzioneQuadro: r.OreCQ || 0,
                collaudoElettromeccanico: r.OreCIE || 0,
                collaudoSoftware: r.OreCIS || 0,
            },
            costi: {
                manodopera: isUL
                    ? Number(r.CostoManodoperaUL) || 0
                    : Number(r.CostoManodoperaCE) || 0,
                materiali: isUL
                    ? Number(r.CostoMaterialiUL) || 0
                    : Number(r.CostoMaterialiCE) || 0,
                totale: isUL
                    ? Number(r.CostoTotaleUL) || 0
                    : Number(r.CostoTotaleCE) || 0,
            }
        }));

        res.json(optionals);
    } catch (err) {
        console.error('Errore API optionals:', err.message);
        res.status(500).json({ error: 'Errore nel caricamento degli optionals.' });
    }
});

module.exports = router;
