/**
 * scripts/generateCSV.js — Script una tantum per generare i CSV dal file Excel
 *
 * Legge "File dati.xlsx" e produce:
 *   - data/listino.csv        (prodotti con equipment, ore, costi)
 *   - data/optionals.csv      (opzionali per tipologia/modello)
 *   - data/costi_manodopera.csv (costi orari)
 *   - data/users.csv          (utenti e password)
 *
 * Uso: node scripts/generateCSV.js
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const EXCEL_PATH = path.join(ROOT, 'File dati.xlsx');

// Assicura che la cartella data/ esista
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const wb = XLSX.readFile(EXCEL_PATH);

// ═══════════════════════════════════════════
// 1. COSTI MANODOPERA
// ═══════════════════════════════════════════
function generaCostiManodopera() {
    const ws = wb.Sheets['VALORI'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const righe = [
        ['Attivita', 'CostoOrario']
    ];

    // Le righe 2-6 del foglio VALORI contengono i costi
    const mapping = [
        { row: 2, name: 'Studio Elettromeccanico' },
        { row: 3, name: 'Studio Software' },
        { row: 4, name: 'Costruzione Elettromeccanica' },
        { row: 5, name: 'Collaudo Elettromeccanico' },
        { row: 6, name: 'Collaudo Software' },
    ];

    mapping.forEach(m => {
        const r = data[m.row];
        if (r && r[1]) {
            const costo = typeof r[1] === 'string' ? r[1].replace('€', '').trim() : r[1];
            righe.push([m.name, costo]);
        }
    });

    const csv = righe.map(r => r.join(',')).join('\n');
    fs.writeFileSync(path.join(DATA_DIR, 'costi_manodopera.csv'), csv, 'utf-8');
    console.log('✓ data/costi_manodopera.csv generato');
}

// ═══════════════════════════════════════════
// 2. USERS
// ═══════════════════════════════════════════
function generaUsers() {
    const csv = 'username,password\nadmin,admin123';
    fs.writeFileSync(path.join(DATA_DIR, 'users.csv'), csv, 'utf-8');
    console.log('✓ data/users.csv generato');
}

// ═══════════════════════════════════════════
// 3. LISTINO (prodotti principali)
// ═══════════════════════════════════════════

/**
 * Mappa dei fogli prodotto con le relative configurazioni colonne.
 * Ogni entry definisce: tipologia, modello, e le colonne significative.
 */
const PRODUCT_SHEETS = [
    {
        sheet: 'PASTA CORTA - ECOSYSTEM',
        tipologia: 'Pasta Corta',
        modello: 'TCM Ecosystem',
        headerRow: 1, // riga indice (0-based) con le intestazioni
        dataStartRow: 3, // prima riga dati (riga 3 è ID=1, 500 kg)
        cols: {
            produzione: 1,    // colonna B (PRODUZIONE)
            pressa: 2,
            gruppoTaglio: 3,
            trabatto: 4,
            elevatore: 5,
            essiccatoio: 6,
            raffreddatore: 7,
            oreSE: 8,
            oreSSP: 9,
            oreSSH: 10,
            oreCQ: 11,
            oreCIE: 12,
            oreCIS: 13,
            costoManodoperaCE: 14,
            costoManodoperaUL: 15,
            costoMaterialiCE: 16,
            costoMaterialiUL: 17,
            dimensioni: 18,
            costoTotaleCE: 19,
            costoTotaleUL: 20
        }
    },
    {
        sheet: 'PASTA CORTA - TCM100',
        tipologia: 'Pasta Corta',
        modello: 'TCM 100',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: 1,
            gruppoTaglio: 2,
            trabatto: 3,
            elevatore: 4,
            essiccatoio: 5,
            raffreddatore: 6,
            oreSE: 7,
            oreSSP: 8,
            oreSSH: 9,
            oreCQ: 10,
            oreCIE: 11,
            oreCIS: 12,
            costoManodoperaCE: 13,
            costoManodoperaUL: 14,
            costoMaterialiCE: 15,
            costoMaterialiUL: 16,
            dimensioni: 17,
            costoTotaleCE: 18,
            costoTotaleUL: 19
        }
    },
    {
        sheet: 'PASTA CORTA - ROMET',
        tipologia: 'Pasta Corta',
        modello: 'Romet',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: 1,
            gruppoTaglio: 2,
            trabatto: 3,
            elevatore: 4,
            essiccatoio: 5,
            raffreddatore: 6,
            oreSE: 7,
            oreSSP: 8,
            oreSSH: 9,
            oreCQ: 10,
            oreCIE: 11,
            oreCIS: 12,
            costoManodoperaCE: 13,
            costoManodoperaUL: 14,
            costoMaterialiCE: 15,
            costoMaterialiUL: 16,
            dimensioni: 17,
            costoTotaleCE: 18,
            costoTotaleUL: 19
        }
    },
    {
        sheet: 'PASTA LUNGA - GPL180',
        tipologia: 'Pasta Lunga',
        modello: 'GPL 180',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: 1,
            gruppoTaglio: null, // non presente, sostituito da Formatrice
            formatrice: 2,
            trabatto: null,
            elevatore: null,
            essiccatoio: 5,
            raffreddatore: null,
            oreSE: 7,
            oreSSP: 8,
            oreSSH: 9,
            oreCQ: 10,
            oreCIE: 11,
            oreCIS: 12,
            costoManodoperaCE: 13,
            costoManodoperaUL: 14,
            costoMaterialiCE: 15,
            costoMaterialiUL: 16,
            dimensioni: 17,
            costoTotaleCE: 18,
            costoTotaleUL: 19
        }
    },
    {
        sheet: 'PASTA LUNGA - ITRG270',
        tipologia: 'Pasta Lunga',
        modello: 'ITRG 270',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: 1,
            formatrice: 2,
            essiccatoio: 5,
            oreSE: 7,
            oreSSP: 8,
            oreSSH: 9,
            oreCQ: 10,
            oreCIE: 11,
            oreCIS: 12,
            costoManodoperaCE: 13,
            costoManodoperaUL: 14,
            costoMaterialiCE: 15,
            costoMaterialiUL: 16,
            dimensioni: 17,
            costoTotaleCE: 18,
            costoTotaleUL: 19
        }
    },
    {
        sheet: 'SILI PASTA CORTA',
        tipologia: 'Sili Pasta Corta',
        modello: 'Sili Pasta Corta',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0, // CONFIGURAZIONE
            oreSE: 3,
            oreSSP: 4,
            oreSSH: 5,
            oreCQ: 6,
            oreCIE: 7,
            oreCIS: 8,
            costoManodoperaCE: 9,
            costoManodoperaUL: 10,
            costoMaterialiCE: 11,
            costoMaterialiUL: 12,
            dimensioni: 13,
            costoTotaleCE: 14,
            costoTotaleUL: 15
        }
    },
    {
        sheet: 'SILI PASTA LUNGA',
        tipologia: 'Sili Pasta Lunga',
        modello: 'Sili Pasta Lunga',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            oreSE: 3,
            oreSSP: 4,
            oreSSH: 5,
            oreCQ: 6,
            oreCIE: 7,
            oreCIS: 8,
            costoManodoperaCE: 9,
            costoManodoperaUL: 10,
            costoMaterialiCE: 11,
            costoMaterialiUL: 12,
            dimensioni: 13,
            costoTotaleCE: 14,
            costoTotaleUL: 15
        }
    },
    {
        sheet: 'COUSCOUS',
        tipologia: 'Couscous',
        modello: 'Couscous',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: null,
            gruppoFormazione: 1,
            cuocitore: 2,
            essiccatoio: 5,
            raffreddatore: 6,
            oreSE: 7,
            oreSSP: 8,
            oreSSH: 9,
            oreCQ: 10,
            oreCIE: 11,
            oreCIS: 12,
            costoManodoperaCE: 13,
            costoManodoperaUL: 14,
            costoMaterialiCE: 15,
            costoMaterialiUL: 16,
            dimensioni: 17,
            costoTotaleCE: 18,
            costoTotaleUL: 19
        }
    },
    {
        sheet: 'GM',
        tipologia: 'GM',
        modello: 'GM',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: 1,
            niditrice: 2,
            telaio: 3,
            essiccatoio: 4,
            oreSE: 6,
            oreSSP: 7,
            oreSSH: 8,
            oreCQ: 9,
            oreCIE: 10,
            oreCIS: 11,
            costoManodoperaCE: 12,
            costoManodoperaUL: 13,
            costoMaterialiCE: 14,
            costoMaterialiUL: 15,
            dimensioni: null,
            costoTotaleCE: 16,
            costoTotaleUL: 17
        }
    },
    {
        sheet: 'CTA_NIDI',
        tipologia: 'CTA Nidi',
        modello: 'CTA Nidi',
        headerRow: 1,
        dataStartRow: 2,
        cols: {
            produzione: 0,
            pressa: 1,
            niditrice: 2,
            essiccatoio: 3,
            raffreddatore: 4,
            oreSE: 5,
            oreSSP: 6,
            oreSSH: 7,
            oreCQ: 8,
            oreCIE: 9,
            oreCIS: 10,
            costoManodoperaCE: 11,
            costoManodoperaUL: 12,
            costoMaterialiCE: 13,
            costoMaterialiUL: 14,
            dimensioni: 15,
            costoTotaleCE: 16,
            costoTotaleUL: 17
        }
    },
];

function generaListino() {
    const headers = [
        'Tipologia', 'Modello', 'Produzione',
        'Pressa', 'GruppoTaglio', 'Trabatto', 'Elevatore',
        'Essiccatoio', 'Raffreddatore', 'Formatrice',
        'GruppoFormazione', 'Cuocitore', 'Niditrice', 'Telaio',
        'OreSE', 'OreSSP', 'OreSSH', 'OreCQ', 'OreCIE', 'OreCIS',
        'CostoManodoperaCE', 'CostoManodoperaUL',
        'CostoMaterialiCE', 'CostoMaterialiUL',
        'Dimensioni', 'CostoTotaleCE', 'CostoTotaleUL'
    ];

    const righe = [];

    PRODUCT_SHEETS.forEach(config => {
        const ws = wb.Sheets[config.sheet];
        if (!ws) { console.warn(`⚠ Foglio "${config.sheet}" non trovato`); return; }

        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        const cols = config.cols;

        // Leggi le righe dati a partire da dataStartRow
        for (let i = config.dataStartRow; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const produzione = cols.produzione !== undefined ? row[cols.produzione] : '';
            if (!produzione || produzione === '' || produzione === '---') continue;

            // Controlla che ci siano almeno dei dati significativi (non tutte "---" o 0)
            const oreSE = cols.oreSE !== undefined ? row[cols.oreSE] : '';
            const oreCQ = cols.oreCQ !== undefined ? row[cols.oreCQ] : '';

            // Salta righe senza costi (tutto a 0 o vuoto)
            const costoMdoCE = cols.costoManodoperaCE !== undefined ? row[cols.costoManodoperaCE] : 0;
            const costoMatCE = cols.costoMaterialiCE !== undefined ? row[cols.costoMaterialiCE] : 0;
            if (costoMdoCE === 0 && costoMatCE === 0 && oreSE === 0 && oreCQ === 0) continue;

            const getValue = (colName) => {
                if (cols[colName] === undefined || cols[colName] === null) return '';
                const val = row[cols[colName]];
                if (val === '---' || val === undefined) return '';
                return val;
            };

            const formatNum = (val) => {
                if (val === '' || val === undefined || val === null) return '';
                if (typeof val === 'string') {
                    // Rimuovi "€", spazi, punti come separatore migliaia
                    val = val.replace(/€/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
                }
                const num = Number(val);
                return isNaN(num) ? '' : Math.round(num * 100) / 100;
            };

            const riga = {
                Tipologia: config.tipologia,
                Modello: config.modello,
                Produzione: produzione,
                Pressa: getValue('pressa'),
                GruppoTaglio: getValue('gruppoTaglio'),
                Trabatto: getValue('trabatto'),
                Elevatore: getValue('elevatore'),
                Essiccatoio: getValue('essiccatoio'),
                Raffreddatore: getValue('raffreddatore'),
                Formatrice: getValue('formatrice'),
                GruppoFormazione: getValue('gruppoFormazione'),
                Cuocitore: getValue('cuocitore'),
                Niditrice: getValue('niditrice'),
                Telaio: getValue('telaio'),
                OreSE: formatNum(getValue('oreSE')),
                OreSSP: formatNum(getValue('oreSSP')),
                OreSSH: formatNum(getValue('oreSSH')),
                OreCQ: formatNum(getValue('oreCQ')),
                OreCIE: formatNum(getValue('oreCIE')),
                OreCIS: formatNum(getValue('oreCIS')),
                CostoManodoperaCE: formatNum(getValue('costoManodoperaCE')),
                CostoManodoperaUL: formatNum(getValue('costoManodoperaUL')),
                CostoMaterialiCE: formatNum(getValue('costoMaterialiCE')),
                CostoMaterialiUL: formatNum(getValue('costoMaterialiUL')),
                Dimensioni: getValue('dimensioni'),
                CostoTotaleCE: formatNum(getValue('costoTotaleCE')),
                CostoTotaleUL: formatNum(getValue('costoTotaleUL')),
            };

            righe.push(riga);
        }
    });

    // Genera CSV
    const csvLines = [headers.join(',')];
    righe.forEach(r => {
        const vals = headers.map(h => {
            const v = r[h];
            if (v === '' || v === undefined) return '';
            // Escape virgole e virgolette nel CSV
            const str = String(v);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        });
        csvLines.push(vals.join(','));
    });

    fs.writeFileSync(path.join(DATA_DIR, 'listino.csv'), csvLines.join('\n'), 'utf-8');
    console.log(`✓ data/listino.csv generato (${righe.length} prodotti)`);
}

// ═══════════════════════════════════════════
// 4. OPTIONALS
// ═══════════════════════════════════════════
function generaOptionals() {
    const headers = [
        'Tipologia', 'Modello', 'ID', 'Descrizione',
        'OreSE', 'OreSSP', 'OreSSH', 'OreCQ', 'OreCIE', 'OreCIS',
        'CostoManodoperaCE', 'CostoManodoperaUL',
        'CostoMaterialiCE', 'CostoMaterialiUL',
        'CostoTotaleCE', 'CostoTotaleUL'
    ];

    const righe = [];

    // I fogli con optionals sono quelli di prodotto più grandi.
    // Gli optionals si trovano dopo la sezione "OPTIONALS" in ogni foglio.
    const sheetsWithOptionals = [
        { sheet: 'PASTA CORTA - ECOSYSTEM', tipologia: 'Pasta Corta', modello: 'TCM Ecosystem' },
        { sheet: 'PASTA CORTA - TCM100', tipologia: 'Pasta Corta', modello: 'TCM 100' },
        { sheet: 'PASTA CORTA - ROMET', tipologia: 'Pasta Corta', modello: 'Romet' },
        { sheet: 'PASTA LUNGA - GPL180', tipologia: 'Pasta Lunga', modello: 'GPL 180' },
        { sheet: 'PASTA LUNGA - ITRG270', tipologia: 'Pasta Lunga', modello: 'ITRG 270' },
        { sheet: 'SILI PASTA CORTA', tipologia: 'Sili Pasta Corta', modello: 'Sili Pasta Corta' },
        { sheet: 'SILI PASTA LUNGA', tipologia: 'Sili Pasta Lunga', modello: 'Sili Pasta Lunga' },
        { sheet: 'COUSCOUS', tipologia: 'Couscous', modello: 'Couscous' },
        { sheet: 'GM', tipologia: 'GM', modello: 'GM' },
        { sheet: 'CTA_NIDI', tipologia: 'CTA Nidi', modello: 'CTA Nidi' },
    ];

    sheetsWithOptionals.forEach(config => {
        const ws = wb.Sheets[config.sheet];
        if (!ws) return;

        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

        // Trova la riga "OPTIONALS"
        let optionalsStart = -1;
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (row && row[0] && String(row[0]).toUpperCase().includes('OPTIONAL')) {
                optionalsStart = i + 1;
                break;
            }
        }

        if (optionalsStart === -1) return;

        // Le righe degli optionals iniziano dopo "OPTIONALS"
        // Il layout tipico è: ID, (vuoto), Descrizione, ..., OreSE, OreSSP, OreSSH, OreCQ, ..., CostoManodoperaCE, ...
        for (let i = optionalsStart; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const id = row[0];
            if (!id || id === '' || typeof id !== 'number') continue;

            const descrizione = row[2] || '';
            if (!descrizione || descrizione === '') continue;
            if (String(descrizione).includes('#REF')) continue;

            const formatNum = (val) => {
                if (val === '' || val === undefined || val === null) return '';
                if (typeof val === 'string') {
                    if (val.includes('#VALUE') || val.includes('#REF') || val.includes('DaDef')) return '';
                    val = val.replace(/€/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
                }
                const num = Number(val);
                return isNaN(num) ? '' : Math.round(num * 100) / 100;
            };

            // Colonne degli optionals (layout standard nella maggior parte dei fogli)
            const riga = {
                Tipologia: config.tipologia,
                Modello: config.modello,
                ID: id,
                Descrizione: descrizione,
                OreSE: formatNum(row[9]),
                OreSSP: formatNum(row[10]),
                OreSSH: formatNum(row[11]),
                OreCQ: formatNum(row[12]),
                OreCIE: formatNum(row[13]),
                OreCIS: formatNum(row[14]),
                CostoManodoperaCE: formatNum(row[15]),
                CostoManodoperaUL: formatNum(row[16]),
                CostoMaterialiCE: formatNum(row[17]),
                CostoMaterialiUL: formatNum(row[18]),
                CostoTotaleCE: formatNum(row[20]),
                CostoTotaleUL: formatNum(row[21]),
            };

            righe.push(riga);
        }
    });

    // Genera CSV
    const csvLines = [headers.join(',')];
    righe.forEach(r => {
        const vals = headers.map(h => {
            const v = r[h];
            if (v === '' || v === undefined) return '';
            const str = String(v);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        });
        csvLines.push(vals.join(','));
    });

    fs.writeFileSync(path.join(DATA_DIR, 'optionals.csv'), csvLines.join('\n'), 'utf-8');
    console.log(`✓ data/optionals.csv generato (${righe.length} opzionali)`);
}

// ═══════════════════════════════════════════
// ESECUZIONE
// ═══════════════════════════════════════════
console.log('═══ Generazione CSV da File dati.xlsx ═══\n');
generaCostiManodopera();
generaUsers();
generaListino();
generaOptionals();
console.log('\n═══ Completato! ═══');
