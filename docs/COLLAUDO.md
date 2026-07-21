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

| ID | Data | Area / caso | Gravità | Descrizione | Atteso | Ottenuto | Sprint | Stato | Commit |
|----|------|-------------|---------|-------------|--------|----------|--------|-------|--------|
| C-001 | 2026-07-04 | E1 / B2-B3 — guard fase | bassa | Il messaggio di blocco del guard (disattivazione fase iniziale / fase in uso) compare in fondo alla card «Fasi del workflow», posizione poco visibile | Messaggio in un popup | Messaggio inline in fondo alla card | 1 | risolto | Sprint 1 |
| C-002 | 2026-07-04 | E1/E2 / B6 — eliminazione | media | Manca l'eliminazione fisica di fasi, transizioni, campi, menu (set/opzioni) e anagrafiche: si può solo disattivare | Poter eliminare (quando non in uso) fasi, transizioni, campi, menu, collaboratori, professionisti | Solo disattivazione | 2 | aperto | |
| C-003 | 2026-07-04 | E10/E11 / I3-K1 — temi | bassa | Il banner informativo del Cestino («Le pratiche qui elencate sono cestinate…») è illeggibile con i temi Scuro e Deep dark: testo chiaro su sfondo giallo semantico fisso | L'avviso resta leggibile in ogni tema | Illeggibile in Scuro/Deep dark | 1 | risolto | Sprint 1 |
| C-004 | 2026-07-04 | E11 / K5 — restore | bassa | Ripristinando uno zip non valido, il messaggio d'errore è tecnico e lungo | Messaggio semplice, es. «Impossibile ripristinare il backup: archivio non valido» | «…Error invoking remote method 'backup:restore': ValidationError: Archivio non valido: manifest mancante» | 1 | risolto | Sprint 1 |


<!--
Esempio di riga:
| C-001 | 2026-07-04 | K4 Backup restore | alta | Dopo il restore l'app non riparte | Riavvio automatico sui dati del backup | Finestra resta chiusa | aperto | — |
-->
