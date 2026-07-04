# ROADMAP — Piano post-MVP e correzioni

Documento **vivo**. Raccoglie, in ordine di priorità, il lavoro successivo al completamento dell'MVP: prima le
**correzioni** emerse dal collaudo (`COLLAUDO.md`), poi le **rifiniture**, infine le **epiche post-MVP** già
previste dai documenti. Le stime sono grossolane: **S** (~mezza giornata), **M** (~1–2 giorni), **L** (≥3 giorni).

Le stime si affinano quando la voce diventa una storia con criteri d'accettazione (`00-backlog-mvp.md` /
`ways-of-working.md`).

---

## 1. Correzioni dal collaudo — priorità massima

Popolata dai difetti `bloccante`/`alta` (e selezionati `media`) di `COLLAUDO.md`. Ogni voce cita l'ID del difetto.

| Priorità | Voce | Origine (COLLAUDO) | Stima | Stato |
|---|---|---|---|---|
| _(da compilare dopo il collaudo)_ | | | | |

## 2. Rifiniture (media/bassa)

| Voce | Stima | Note |
|---|---|---|
| _(da compilare)_ | | |
| Icona applicazione/installer (`resources/icon.ico`/`.icns`) | S | Predisposto in `electron-builder.yml` (commentato). |
| Bonifica colori hardcoded residui (badge, hex) | S–M | Annotata da S11.1; non bloccante. |

## 3. Post-MVP — epiche/funzioni previste dai documenti

Priorità indicativa; da concordare dopo il collaudo.

| Epica / storia | Descrizione | Stima | Note |
|---|---|---|---|
| **E14** Protezione dati | Lock con password (S14.1) + **cifratura DB a riposo** (S14.2, SQLCipher via better-sqlite3-multiple-ciphers) | L | Driver già cifrabile (cifratura spenta): nessun cambio di driver. Rilevante per dati sensibili (collaboratori di giustizia). |
| **S9.2** Report aggregati | Riepiloghi per stato/collaboratore/professionista/importi/documenti | M | Should. La pagina Report è già predisposta (informativa). |
| **S9.3** Export Excel | Export `.xlsx` oltre al CSV | M | Could. |
| **E15** Scadenzario/termini | Entità scadenza per pratica + alert dedicati in Dashboard | L | Could. Distinti dagli alert giorni-da-deposito. |
| **E16** Export PDF scheda | PDF della scheda di una singola pratica (dati/importi/storico/documenti) | M | Could. |
| **E12** Assistente locale | Assistente rule-based su dati attivi (conteggi/riepiloghi); API opzionale spenta | L | Post-MVP (v1.1+). |
| **S11.5** Card Alert configurabili | Attiva/disattiva + soglie configurabili degli alert | S–M | Should. Config già presente in `app_settings.alertThresholds`/`alertsEnabled`. |
| **S11.6** Info app | Versione/stato sistema/percorsi in Impostazioni | S | Should. Riusa il canale `app:getVersion`. |
| Numeri procedimento multipli | Più numeri di procedimento per pratica | M | Post-MVP (da backlog). |
| **Code signing installer** | Firma dell'`.exe` (e notarizzazione `.app`) per evitare SmartScreen/Gatekeeper | M | Richiede certificato. Vedi `BUILD-WINDOWS.md`. |
| Percorso dati: **spostamento** | Cambio effettivo del percorso dati (oltre a visualizza/copia/apri) con spostamento a freddo + riavvio | M | Rimandato da S11.2; l'infrastruttura del puntatore è già pronta. |
| Filtri/ricerca sulla **timeline** | Filtrare lo storico nel dettaglio pratica | S | Residuo S5.5. |
| CI: **release automatica** | Pubblicare l'installer come GitHub Release al tag | S | Estende `build-win.yml`. |

---

_Aggiornare questo file quando arrivano gli esiti del collaudo o cambiano le priorità._
