# 03 — Motore di workflow configurabile

Parte centrale e più rischiosa dell'app. Tutto (pratiche, dettaglio, dashboard, alert, report) si appoggia qui. La UI **non contiene fasi né pulsanti hard-coded**: legge la configurazione (Phase, Transition) dal DB e genera tutto a runtime.

**Fonte di verità del workflow standard:** `docs/07-workflow-tree.md` (albero completo fasi/transizioni/timeline). In caso di dubbio sul flusso, quel file prevale. Questo documento descrive il _motore_ che lo implementa.

## Tre concetti distinti

- **(F) Fase** — stato in cui la pratica _resta_. La pratica ha sempre **una sola** fase corrente (`practice.currentPhaseId`).
- **(T) Transizione** — pulsante/azione disponibile da una fase. Definita in tabella `transitions` (from, to, label, flag).
- **(TL) Evento di timeline** — record storico prodotto **da ogni** transizione (`HistoryEvent`). I dati compilati nell'azione (date, importi, modalità, PEC, note) vivono nel payload dell'evento; i valori chiave (importi, date rilevanti) vengono anche denormalizzati sulla pratica per filtri e riepiloghi.

Conseguenza critica (correzione rispetto a una bozza precedente): **solleciti e integrazioni NON sono fasi.** Un sollecito è una transizione ripetibile che resta nella stessa fase e produce un evento. "Integrazione richiesta" è una transizione che porta a `In attesa di integrazione`; "Integrazione inviata" è una transizione che riporta a `In attesa di decreto`. "Invio a SCP" è una transizione che porta a `In attesa di liquidazione SCP`, non una fase.

## Fasi standard (13)

key (immutabile) — displayName — category — finale?

- `depositata` — Depositata — deposited — iniziale, non finale
- `in_attesa_decreto` — In attesa di decreto — awaiting_decree — no
- `in_attesa_integrazione` — In attesa di integrazione — awaiting_integration — no
- `decreto_ricevuto` — Decreto ricevuto — decree_received — no
- `in_attesa_esito_correzione` — In attesa di esito correzione decreto — awaiting_correction — no
- `in_attesa_esito_impugnazione` — In attesa di esito impugnazione — awaiting_appeal — no
- `in_attesa_liquidazione_scp` — In attesa di liquidazione SCP — awaiting_liquidation — no
- `in_attesa_integrazione_scp` — In attesa di integrazione SCP — awaiting_integration_scp — no
- `liquidata` — Liquidata — liquidated — **no** (ha "Chiudi pratica")
- `chiusa` — Chiusa — closed — **finale (+)**
- `rifiutata` — Rifiutata — refused — **finale (-)**
- `sospesa` — Sospesa — suspended — no (temporanea/reversibile)
- `annullata` — Annullata — annulled — **finale (-)**

Fasi finali (nessuna transizione ordinaria in uscita): **chiusa, rifiutata, annullata**. La pratica resta consultabile con tutta la timeline.

## Transizioni: campi e flag

Tabella `transitions`: `id, fromPhaseId, toPhaseId (nullable), buttonLabel, order, isActive` più tre flag:

- `isRepeatable` (bool) — l'azione può essere eseguita più volte e resta disponibile (solleciti, proroga termine). Tipicamente `fromPhaseId == toPhaseId`.
- `isAutomatic` (bool) — eseguita automaticamente dal motore, senza pulsante (es. Depositata -> In attesa di decreto subito dopo la creazione).
- `isResume` (bool) — destinazione **dinamica**: il motore imposta `currentPhaseId = practice.previousPhaseId`. Usata solo da "Riprendi pratica" da `Sospesa`. Quando `isResume = true`, `toPhaseId` è null.

Transizione che "resta nella fase": `fromPhaseId == toPhaseId`. Il motore registra l'evento e NON cambia `currentPhaseId`.

## Ciclo di avanzamento

1. Il dettaglio pratica legge `currentPhaseId`.
2. Recupera le `transitions` attive con `fromPhaseId = currentPhaseId` (escluse le `isAutomatic`), ordinate -> genera un pulsante per ciascuna.
3. L'utente clicca -> form dinamico con i campi configurati per quella transizione (vedi campi configurabili, E1) -> validazione zod (incluso blocco PEC condizionale).
4. Al salvataggio, in transazione:
   - se `isResume`: `currentPhaseId = previousPhaseId`, azzera `previousPhaseId`;
   - se `fromPhaseId == toPhaseId`: nessun cambio di fase;
   - se transizione verso `sospesa`: salva `previousPhaseId = currentPhaseId`, poi `currentPhaseId = sospesa`;
   - altrimenti: `currentPhaseId = toPhaseId`;
   - scrive sempre un `HistoryEvent` (TL) con titolo e payload;
   - denormalizza sulla pratica i valori chiave (importi, date) dove serve;
   - incrementa `version`.
5. Dashboard, alert, report riflettono il nuovo stato perché leggono `currentPhaseId`/`category`.

## Sospensione e ripresa

Da **qualsiasi fase aperta** (non finale) è disponibile "Sospendi pratica" -> `sospesa`, salvando `previousPhaseId`. Da `sospesa`: "Riprendi pratica" (`isResume`, torna a `previousPhaseId`) oppure "Annulla pratica" (-> `annullata`). Questo richiede il campo `previousPhaseId` sulla pratica (vedi `02-data-model.md`).

## Creazione e transizione automatica

Alla creazione la pratica nasce in `depositata` con i dati di deposito; il motore registra l'evento "Pratica depositata" ed esegue subito la transizione `isAutomatic` `depositata -> in_attesa_decreto` (evento "Pratica posta in attesa di decreto"). Stato di riposo effettivo dopo la creazione: `in_attesa_decreto`.

## PEC (condizionale, guidata dai campi)

La PEC non è un flag di fase né logica cablata. Si configura come **visibilità condizionale** di un campo (E1, S1.5): un campo di tipo `pec` (blocco multi-destinatario) viene mostrato solo quando un campo `menu` "modalità" della stessa transizione ha valore uguale all'opzione PEC (`conditionalOnFieldId` + `conditionalValue` sul campo `pec`). A runtime (E5) il motore valuta la condizione, mostra/nasconde il blocco e, se PEC, raccoglie gli indirizzi salvandoli come `PecRecipient`. Deposito e invio SCP usano lo stesso meccanismo su transizioni diverse.

## Coerenza degli stati

Le transizioni invalide non esistono nel grafo, quindi non producono pulsanti. Guard di business aggiuntivi nel service (es. non si raggiunge `liquidata` senza che risultino registrati decreto e invio a SCP). I guard stanno nel service, non nei componenti.

## Dashboard e report (derivati)

Card per fase: una per ogni fase con pratiche attive (escluse le cestinate). Gli alert anzianità riguardano le fasi aperte (non finali). "Vedi pratiche" su una card -> Pratiche filtrate per quella fase. Le nuove fasi configurate dall'utente entrano automaticamente in card, filtri e report.

## Estensione configurabile

L'utente può aggiungere fasi (`category = custom`) e transizioni dalle Impostazioni istanze senza toccare il codice. La nuova fase non deve comparire nel form Nuova pratica: appare solo come pulsante nel dettaglio quando la fase corrente la consente.
