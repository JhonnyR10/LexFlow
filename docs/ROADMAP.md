# ROADMAP — Piano post-MVP e correzioni

Documento **vivo**. Organizza il lavoro successivo all'MVP in **sprint** prioritizzati: prima le correzioni dal
collaudo (`COLLAUDO.md`), poi i residui/rifiniture emersi durante lo sviluppo (`PROGRESS.md`), infine le epiche
post-MVP previste dai documenti. Stime grossolane: **S** (~mezza giornata) · **M** (~1–2 giorni) · **L** (≥3 giorni).
Le stime si affinano quando una voce diventa una storia con criteri d'accettazione (`00-backlog-mvp.md` /
`ways-of-working.md`).

---

## Sprint 1 — Fix rapidi del collaudo `FATTO`

| Voce | Origine | Descrizione | Stima | Stato |
|---|---|---|---|---|
| **C-001** Guard in popup | COLLAUDO C-001 | I messaggi di blocco dei guard (fase iniziale/in uso; anagrafica in uso) escono in un `AlertModal` invece che inline in fondo alla card | S | ✅ fatto |
| **C-003** Banner leggibili | COLLAUDO C-003 | Banner informativi (Cestino, «pratica creata») tema-aware: niente `--color-text` su sfondo semantico fisso | S | ✅ fatto |
| **C-004** Errori IPC puliti | COLLAUDO C-004 | Instradare gli errori IPC in `ipcErrorMessage`; semplificare i testi `ValidationError` del restore | S | ✅ fatto |

## Sprint 2 — Eliminazione fisica (C-002) `FATTO`

**C-002** (COLLAUDO, media). Consentire l'**eliminazione fisica** di **fasi, transizioni, campi, menu (set e
opzioni), professionisti, collaboratori** — **solo quando non in uso** (coerente con CLAUDE.md regola 7:
«non eliminabili se collegati → solo disattivabili», quindi eliminabili quando non collegati). **Stima: M–L.**

Richiede:
- **Doc prima del codice**: `02-data-model.md` (regole di integrità: hard delete config/anagrafiche se non
  referenziate) e `00-backlog-mvp.md` (AC delle relative storie).
- **Backend**: nuovi canali IPC `delete*` per ciascuna entità; guard «non in uso» nei service (riuso del pattern
  `assertCanDeactivate` / `countActivePracticesUsingPhase` in `config/service.ts` e degli analoghi in
  `anagrafiche/service.ts`); `delete` nei repository; verifica FK (una fase referenziata da transizioni/pratiche,
  un menu set con opzioni/campi collegati, ecc.) → blocco con messaggio se referenziata.
- **Frontend**: pulsante «Elimina» nelle sezioni config/anagrafiche + modale di conferma (riuso pattern
  `PermanentDeleteModal`), con blocco via `AlertModal` (Sprint 1) se in uso.

> Nota: chiude i «Delete fisica rinviata (TODO)» annotati su S1.1/S1.2/S1.3/S1.4 e i guard-delete di E2.

## Sprint 3 — Rifiniture / residui MVP `FATTO`

Raccolti dai TODO/residui di `PROGRESS.md`. Priorità e raggruppamento da concordare.

| Voce | Origine | Descrizione | Stima | Stato |
|---|---|---|---|---|
| Filtri/ricerca sulla timeline | S5.5 | Filtrare lo storico nel dettaglio pratica (oggi solo consultabile) | S | ✅ fatto |
| Bonifica colori hardcoded | S11.1 | ~51 hex/colori residui (badge, banner, `#fff` su accent) → token dove sensato | S–M | ✅ fatto |
| Contesto PEC configurabile | `practices/service.ts` | Rendere configurabile sul campo `pec` il contesto (oggi derivato dalla toPhase) | S–M | ✅ fatto |
| Cambio `menuSetId` su campo | `config/service.ts` | Gestire il cambio del menu collegato a un campo con valori già salvati | S | ✅ fatto |
| Scan JSON rigoroso in disattivazione | S-FIX-guards | Controllo d'uso reale di opzione menu/campo dentro `customValues`/`transition_records.values` (oggi avviso non bloccante) | M | ✅ fatto |
| Card «documenti mancanti» in Dashboard | S8.2/8.4 | Aggregato dei documenti mancanti (S8.5) | S | ✅ fatto |
| Icona app/installer | release-prep | Icona placeholder «LF» (`resources/icon.png` + `.icns`, auto-detect electron-builder) | S | ✅ fatto |

## Sprint 4+ — Post-MVP (epiche/funzioni previste) `BACKLOG`

Priorità indicativa; da concordare dopo gli sprint 1–3.

| Epica / storia | Descrizione | Stima | Note |
|---|---|---|---|
| ~~**E14** Protezione dati~~ **✅ FATTA** (2026-07-22) | Lock con password (S14.1) + **cifratura DB a riposo** (S14.2, better-sqlite3-multiple-ciphers) | L | Fatta. Chiave derivata dalla password (PBKDF2), rekey della connessione viva con backup di sicurezza, boot cifrato via unlock. Vincolo: ripristino backup coerente con la stessa password. |
| **S11.2b** Spostamento percorso dati | Cambio effettivo del percorso dati (swap a freddo + riavvio) | M | Infrastruttura puntatore già pronta (S11.2). |
| ~~**S9.2** Report aggregati~~ **✅ FATTA** (2026-07-22) | Riepiloghi per stato/collaboratore/professionista/importi/documenti | M | Fatta. Modulo `report` (IPC `report:summary`, aggregazione SQL backend); pagina Report riscritta. |
| **S9.3** Export Excel | Export `.xlsx` oltre al CSV | M | Could. |
| **S11.5** Card Alert configurabili | Attiva/disattiva + soglie configurabili | S–M | Should. Config già in `app_settings`. |
| ~~**S11.6** Info app~~ **✅ FATTA** (2026-07-22) | Versione/stato sistema/percorsi in Impostazioni | S | Fatta. Sezione «Info app»: versione, runtime, sistema, percorsi, stato sicurezza, conteggi archivio (IPC `app:getInfo`). |
| **E15** Scadenzario/termini | Entità scadenza per pratica + alert dedicati | L | Could. |
| **E16** Export PDF scheda | PDF della scheda di una singola pratica | M | Could. |
| **E12** Assistente locale | Assistente rule-based su dati attivi; API opzionale spenta | L | v1.1+. |
| Numeri procedimento multipli | Più numeri di procedimento per pratica | M | Post-MVP. |
| Code signing installer | Firma `.exe` (+ notarizzazione `.app`) | M | Richiede certificato. Vedi `BUILD-WINDOWS.md`. |
| CI release automatica | Pubblicare l'installer come GitHub Release al tag | S | Estende `build-win.yml`. |

---

_Aggiornare quando arrivano nuovi esiti dal collaudo o cambiano le priorità._
