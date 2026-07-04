# COLLAUDO — Registro esiti e difetti dell'MVP

Registro dei difetti/osservazioni emersi durante il collaudo (`TEST-PLAN-MVP.md`). File **vivo**: si compila man
mano che l'utente segnala. Ogni difetto rilevante diventa una voce in `ROADMAP.md` con una stima, poi si
implementa storia-per-storia secondo la DoD (`ways-of-working.md`).

## Processo

1. **L'utente segnala** un problema (riferendo, se possibile, il caso del test plan, es. «K4», e cosa ha ottenuto).
2. **Claude registra** una riga qui sotto con un ID progressivo (`C-001`, …), classificando la **gravità**.
3. **Classificazione** → se richiede intervento, la voce entra in `ROADMAP.md` con **stima S/M/L** e priorità.
4. **Implementazione**: si aggiornano prima i `docs/` pertinenti (se cambia un requisito), poi il codice; gate
   verdi; `PROGRESS.md` aggiornato; commit. La riga qui passa a `risolto` col riferimento al commit.

**Gravità:** `bloccante` (impedisce l'uso / perdita dati) · `alta` (funzione chiave errata) ·
`media` (difetto non bloccante) · `bassa` (estetica/rifinitura).
**Stato:** `aperto` · `in corso` · `risolto` · `scartato`.

## Registro

| ID | Data | Area / caso | Gravità | Descrizione | Atteso | Ottenuto | Stato | Commit |
|----|------|-------------|---------|-------------|--------|----------|-------|--------|
| B2-B3 | 04/07/2026 | GUARD FASE INIZIALE | LIEVE | IL MESSAGGIO DI ERRORE ESCE MA IN UNA POSIZIONE DA RIVEDERE | IL MESSAGGIO DI ERRORE ESCE IN UNA FINESTRA POPUP | IL MESSAGGIO DI ERRORE ESCE IN FONDO ALLA CARD "FASI DEL WORKFLOW"| APERTO |  |
| B6 | 04/07/2026 | CRUD MENU | LIEVE | MANCA OPZIONE PER ELIMINARE IL MENU A TENDINA (ANCHE IN CAMPI) O ELEMENTI DAI SET | POSSIBILITÀ DI ELMINARE FASI, TRANSIZIONI, CAMPI, MENU, COLLABORATORI E PROFESSIONISTI | SOLO POSSIBILITÀ DI DISATTIVARE | APERTO |  |
| I3 - K1 | 04/07/2026 | DASHBORD & IMPOSTAZIONI APP | LIEVE | QUANDO SI METTONO I TEMI DEEP DARK E SCURO, NON è LEGGIBILE L'avviso ALL'INTERNO DELLA SEZIONE CESTINO "Le pratiche qui elencate sono cestinate (eliminazione logica): restano escluse da dashboard, elenco e avvisi. Puoi ripristinarle per riportarle tra le pratiche attive. I dati e i documenti sono conservati finché non vengono cancellati definitivamente." POICHè IL COLORE DELLA SCRITTA SULLO SFONDO GIALLINO NON RENDE LEGGIBILE IL TUTTO | A QUALUNQUE CAMBIO TEMA TUTTO RIMANE LEGGBILE L'AVVISO ALL'INTERNO DELLA SEZIONE CESTINO NON SI LEGGE CON I DUE TEMI DEEP DARK E SCURO POICHè IL COLORE DELLA SCRITTA SULLO SFONDO GIALLINO NON RENDE LEGGIBILE IL TUTTO | A QUALUNQUE CAMBIO TEMA TUTTO RIMANE LEGGBILE | APERTO |  |
| K5 | 04/07/2026 | IMPOSTAZIONI APP | LIEVE | QUANDO SI FA UN BACKUP CON UN FILE ZIP NO VALIDO, L'ERRORE CHE ESCE è TROPPO LUNGO ED INUTILE | ESCE UN MESSAGGIO DI ERRORE SEMPLICE "IMPOSSIBILE RIPRISTINARE IL BACKUP: ARCHIVIO NON VALIDO" | IL MESSAGGIO DI ERRORE CHE ESCE È IL SEGUENTE Impossibile ripristinare il backup: Error invoking remote method 'backup:restore': ValidationError: Archivio non valido: manifest mancante" | APERTO |  |


<!--
Esempio di riga:
| C-001 | 2026-07-04 | K4 Backup restore | alta | Dopo il restore l'app non riparte | Riavvio automatico sui dati del backup | Finestra resta chiusa | aperto | — |
-->
