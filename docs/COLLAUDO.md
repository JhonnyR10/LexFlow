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
| _(nessuna voce: compilare durante il collaudo)_ | | | | | | | | |

<!--
Esempio di riga:
| C-001 | 2026-07-04 | K4 Backup restore | alta | Dopo il restore l'app non riparte | Riavvio automatico sui dati del backup | Finestra resta chiusa | aperto | — |
-->
