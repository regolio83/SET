# Gara SET di squadra: versione con server

La cartella contiene tutto: `server.js`, `gara-semifinale.html` e `package.json`. Non servono account né librerie: basta Node.js (versione 18 o più recente).

## Provarla su un computer

1. Apri il Terminale nella cartella e scrivi `node server.js` (oppure `npm start`).
2. Apri http://localhost:3000 nel browser.
3. Gli altri dispositivi collegati alla stessa rete Wi-Fi aprono `http://<indirizzo-del-computer>:3000`. Su Mac l'indirizzo si trova in Impostazioni › Wi-Fi › Dettagli.
4. Ognuno sceglie la stessa squadra e scrive il proprio nome.

## Metterla online (per esempio su Render, come l'app di Daniela)

1. Carica il contenuto della cartella in un repository GitHub.
2. Su Render crea un nuovo "Web Service" da quel repository: il comando di avvio (`npm start`) lo trova da solo.
3. Render assegna un indirizzo pubblico: chi lo apre gioca senza registrarsi.

## Limiti del prototipo

- Le squadre si scelgono da un elenco (1–6), senza codice docente né PIN.
- I risultati restano in `risultati.json` sul server. Su Render gratuito questo file si perde a ogni riavvio, quindi per uno storico duraturo serve un database.
- Il timer usa l'orologio di ciascun dispositivo. Un dispositivo con l'ora sbagliata di qualche secondo vede un countdown leggermente diverso, ma la gara la chiude comunque il server.
