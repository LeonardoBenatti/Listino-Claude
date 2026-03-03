/**
 * csvReader.js — Utilità per leggere il file CSV e convertirlo in JSON
 *
 * Utilizza la libreria 'csv-parser' per effettuare il parsing riga per riga.
 * Restituisce una Promise che si risolve con un array di oggetti,
 * dove ogni oggetto corrisponde a una riga del CSV.
 *
 * Uso:
 *   const readCSV = require('./utils/csvReader');
 *   const dati = await readCSV('data/listino.csv');
 */

const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

/**
 * Legge un file CSV e restituisce i dati come array di oggetti JSON.
 * @param {string} filePath — Percorso relativo o assoluto del file CSV
 * @returns {Promise<Array<Object>>} — Array di oggetti (una entry per riga)
 */
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    // Risolvi il percorso relativo alla root del progetto
    const absolutePath = path.resolve(__dirname, '..', filePath);

    // Verifica che il file esista prima di provare a leggerlo
    if (!fs.existsSync(absolutePath)) {
      return reject(new Error(`File CSV non trovato: ${absolutePath}`));
    }

    fs.createReadStream(absolutePath)
      .pipe(csvParser())
      .on('data', (row) => {
        results.push(row);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => {
        reject(new Error(`Errore durante la lettura del CSV: ${err.message}`));
      });
  });
}

module.exports = readCSV;
