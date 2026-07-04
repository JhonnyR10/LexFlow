# TEST-PLAN-MVP — Collaudo funzionale LexFlow

Checklist per collaudare l'MVP end-to-end. Eseguire preferibilmente sull'app **installata su Windows** (vedi
`BUILD-WINDOWS.md`); in alternativa in sviluppo con `npm run desktop`. Segnare l'esito nella colonna **Esito**
(OK / KO / nota). I difetti vanno registrati in `docs/COLLAUDO.md` (con ID), poi pianificati/stimati in
`docs/ROADMAP.md`.

Legenda esito: `OK` conforme · `KO` difetto (aprire riga in COLLAUDO) · `—` non testato.

> Suggerimento: prima di iniziare, valuta se testare su **archivio vuoto** (installazione pulita) o su dati di
> prova. Alcuni casi (Dashboard, alert, export) rendono meglio con qualche pratica creata.

---

## A. Avvio / E0 — Fondazioni

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| A1 | Primo avvio | Installa e avvia | Finestra su Dashboard, nessun errore; creati `%APPDATA%\LexFlow\lexflow.db` e `config.json` | OK |
| A2 | Seed | Apri «Impostazioni istanze» | 13 fasi e le transizioni standard presenti; 5 set di menu | OK |
| A3 | Persistenza | Chiudi e riapri l'app | I dati inseriti restano | OK |
| A4 | ErrorBoundary | (dev) forza un errore di rendering | Fallback leggibile, non schermo bianco | OK |

## B. E1 — Configurazione workflow

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| B1 | CRUD fasi | Crea/modifica/riordina una fase | Salvataggio corretto; ordine rispettato | OK |
| B2 | Guard fase iniziale | Prova a disattivare l'unica fase iniziale | Bloccato con messaggio | OK |
| B3 | Guard fase in uso | Disattiva una fase usata da una pratica attiva | Bloccato (conteggio nel messaggio) | OK |
| B4 | CRUD transizioni | Crea transizione da→a con etichetta | Compare solo dalla fase di partenza; niente verso fasi inattive | OK |
| B5 | CRUD campi | Crea campo `scope=general` e uno `scope=transition` | Il generale compare in Nuova pratica; quello di transizione solo nel form di quella transizione | OK |
| B6 | CRUD menu | Crea set + opzioni, riordina, disattiva | Opzione usata non eliminabile (solo disattivabile) | OK |
| B7 | Regola PEC | Campo `pec` condizionato a modalità=PEC | I campi PEC compaiono solo con modalità=PEC; altrimenti nascosti/non obbligatori | OK |

## C. E2 — Anagrafiche

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| C1 | CRUD professionisti | Crea/modifica | Denominazione derivata da cognome+nome | OK |
| C2 | CRUD collaboratori | Crea/modifica | Come sopra; codice interno opzionale | OK |
| C3 | Guard disattivazione | Disattiva un'anagrafica collegata a una pratica | Bloccato con messaggio | OK |

## D. E4 — Creazione/modifica pratica

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| D1 | Codice istanza | Crea due pratiche lo stesso giorno | Progressivi distinti, formato `AAAAMMGG_SIGLA_NNN` | OK |
| D2 | Form nuova pratica | Compila dati generali + campi custom + PEC deposito | Validazione obbligatori; nasce in fase iniziale | OK |
| D3 | Modifica | Cambia alcuni campi editabili e salva | **Un solo** evento `updated` nello storico; codice e fase invariati | OK |
| D4 | Salvataggio senza modifiche | Apri Modifica e salva senza cambiare nulla | Nessun evento storico | OK |

## E. E5 — Workflow operativo

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| E1 | Pulsanti dinamici | Apri una pratica | I pulsanti azione = transizioni configurate dalla fase corrente | OK |
| E2 | Form transizione | Esegui una transizione con campi | Validazione (incluso blocco PEC); crea record + evento; cambia fase se previsto | OK |
| E3 | Ripetibile | Registra un sollecito | La fase non cambia; evento registrato | OK |
| E4 | Sospensione/ripresa | Sospendi poi riprendi | Torna alla fase precedente corretta | OK |
| E5 | Guard liquidazione | Prova a raggiungere «Liquidata» senza decreto+invio SCP | Impedito | OK |
| E6 | Timeline | Apri lo storico | Eventi in ordine, leggibili | OK |

## F. E6 — Importi

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| F1 | Quattro importi | Compila richiesto (pratica) e concesso/fatturato/liquidato (transizioni) | Compaiono nella sezione Importi | OK |
| F2 | Differenze | Verifica differenze e % riduzione | Calcolate; operando mancante → «Non calcolabile»; mai `NaN` | OK |

## G. E7 — Documenti

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| G1 | Upload | Carica decreto e fattura | File copiato in `documenti\<codice>\`; controllo «mancante» sparisce | OK |
| G2 | Sostituzione | Ricarica lo stesso tipo | Sostituisce (vecchio file rimosso) | OK |
| G3 | Apri | Apri un documento | Si apre col programma di sistema | OK |
| G4 | Guard cestino | Metti la pratica nel cestino e prova upload/elimina | Bloccato; lista/apertura consentite | OK |
| G5 | Sopravvivenza | Cestina e ripristina | I documenti restano | OK |

## H. E3 — Elenco e ricerca

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| H1 | Ricerca | Cerca per codice/nome/soggetti/autorità/note | Risultati coerenti, accent/case-insensitive | OK |
| H2 | Filtri | Combina fase/collaboratore/professionista/date/importi + Azzera | Filtri combinati (AND); azzera ripristina | OK |
| H3 | Ordinamento | Clic sulle intestazioni | Asc/desc; nulli in fondo | OK |
| H4 | Selezione multipla | Seleziona righe filtrate | «Seleziona tutto» agisce solo sul filtrato | OK |

## I. E8 — Dashboard

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| I1 | Card per fase | Con pratiche in più fasi | Card solo per fasi con pratiche attive; conteggi corretti | OK |
| I2 | Alert soglie | Pratiche con anzianità >30/>60/>90 gg | Box giallo/arancione/rosso; una pratica = un box con motivazioni aggregate | OK |
| I3 | Colori semantici | Cambia tema | Alert/errori/distruttive **invariati** in ogni tema | OK |
| I4 | Anzianità | Sezione «Pratiche più vecchie» | Top-5 per giorni da deposito; senza data escluse | OK |
| I5 | Giorni da deposito | Dettaglio pratica | «Giorni dalla data deposito: X»; assente → «Data deposito non presente» | OK |
| I6 | Stato vuoto | Archivio senza pratiche | Un solo blocco «Archivio vuoto…» + azione | OK |
| I7 | Vedi pratiche | Clic su una card fase | Apre Pratiche filtrato per quella fase | OK  |

## J. E10 — Cestino

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| J1 | Sposta | Cestina (singola e in blocco) con motivo | Motivo obbligatorio; sparisce da elenco/Dashboard; compare nel Cestino con data+motivo | OK |
| J2 | Ripristina | Ripristina (singolo/bulk/da dettaglio) | Ritorna in elenco/Dashboard/conteggi | OK |
| J3 | Cancella | Cancellazione definitiva dal Cestino | Conferma forte; sparisce del tutto; righe figlie + cartella documenti rimosse | OK |

## K. E11 — Impostazioni app

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| K1 | Temi | Prova i 5 temi | Sfondo/superfici/accenti cambiano; semantici fissi; persiste al riavvio | OK |
| K2 | Percorso dati | Copia percorso / apri cartella | Copia la stringa; apre la cartella | OK |
| K3 | Backup export | «Esporta backup…» | `.zip` con `lexflow.db`+`documenti/`+`data.json`+`manifest.json` | OK |
| K4 | Backup restore | «Ripristina da backup…» con uno zip | Conferma forte → riavvio → dati del backup; esiste `pre-restore-<ts>/` | OK |
| K5 | Restore zip invalido | Scegli un file non valido | Errore chiaro, nessuna sovrascrittura | OK |
| K6 | Reset archivio | «Reset archivio…» | Doppia conferma; crea `pre-reset-<ts>.zip`; svuota pratiche+anagrafiche; workflow/impostazioni intatti | OK |
| K7 | Backup automatico | Configura on/off, trigger, ore, N copie; salva | Persiste; alla chiusura crea `lexflow-autobackup-<ts>.zip`; rotazione tiene N; cambia/apri cartella | OK |

## L. E9.1 — Export CSV

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| L1 | Rispetta filtri | Applica ricerca/filtri, poi «Esporta CSV» | Il CSV contiene solo le righe filtrate; cestino escluso | OK |
| L2 | Formato Excel-IT | Apri il CSV in Excel italiano | Colonne separate (`;`), decimali con virgola, date gg/mm/aaaa, accenti corretti (BOM) | OK |
| L3 | Colonne importi | Verifica le colonne | Presenti richiesto/concesso/fatturato/liquidato | OK |
| L4 | Stato vuoto | Filtri con 0 risultati | Pulsante «Esporta CSV» disabilitato | OK |

## M. E13 — Qualità trasversale

| # | Caso | Passi | Atteso | Esito |
|---|---|---|---|---|
| M1 | Stati UI | Naviga tutte le viste | Ogni vista gestisce loading/empty/error; nessun `NaN`/`undefined` | OK |
| M2 | Report | Apri «Report» | Pagina informativa (rimanda a «Pratiche → Esporta CSV»), link funzionante | OK |
| M3 | Niente pagine dev | Guarda la sidebar | Nessun link «Diagnostica IPC»; `/dev/ipc` non raggiungibile | OK |
| M4 | Validazioni | Invia form con dati errati | Messaggi di validazione chiari (renderer) | OK |

---

## Esito complessivo

- [ ] Tutti i casi **OK** → MVP collaudato.
- [ ] Difetti registrati in `docs/COLLAUDO.md` e pianificati in `docs/ROADMAP.md`.
