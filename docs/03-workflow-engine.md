# 03 — Motore di workflow configurabile

È la parte centrale e più rischiosa dell'app. Tutto (pratiche, dettaglio, dashboard, alert, report) si appoggia qui. La UI **non contiene fasi né pulsanti hard-coded**: legge la configurazione e genera tutto a runtime.

## Principio

La configurazione (Phase, Transition, FieldDef, MenuSet) è dato in DB, non codice. Aggiungere una fase "Impugnazione decreto depositata" o "Correzione decreto richiesta" non richiede modifiche al codice: si crea la fase, le sue transizioni e i suoi campi dalle Impostazioni istanze, e compaiono automaticamente nel dettaglio pratica e in dashboard.

## Modello logico

- **Phase**: nodo del grafo. Ha `category` (semantica stabile per dashboard/alert), `isInitial`, `isFinal`, `pecEnabled`.
- **Transition**: arco diretto `from → to` con `buttonLabel`. Definisce i pulsanti disponibili.
- **FieldDef (scope=phase)**: campi da compilare quando si registra quella fase.
- **PhaseRecord**: istanza registrata di una fase su una pratica (ripetibile).

## Ciclo di avanzamento (UC4)

1. Il dettaglio pratica legge `currentPhaseId`.
2. Recupera le `Transition` attive con `fromPhaseId = currentPhaseId`, ordinate per `order` → genera un pulsante per ciascuna (`buttonLabel`).
3. L'utente clicca un pulsante → si apre il **form dinamico** della fase di destinazione, costruito dalle `FieldDef(scope=phase, phaseId=to)`.
4. Validazione zod dei campi (obbligatori, formati, regola PEC condizionale).
5. Al salvataggio, in transazione:
   - crea `PhaseRecord(practiceId, phaseId=to, values, note)`;
   - aggiorna `practice.currentPhaseId = to` (se la transizione cambia la fase logica; le fasi ripetibili come Sollecito possono non cambiarla);
   - scrive `HistoryEvent(type, title, fromPhaseId, toPhaseId, note, payload)`;
   - incrementa `version`.
6. Dashboard, alert e report riflettono il nuovo stato automaticamente perché leggono `currentPhaseId`/`category`.

## Form dinamico — tipi di campo

`testo_breve, testo_lungo, numero, importo, data, menu (da MenuSet), si_no, note, file`. Ogni campo rispetta `required`, `order`, e il proprio menu se `type=menu`.

## Regola PEC condizionale

Se un campo "modalità" (deposito o invio SCP) ha valore `PEC` **e** la fase ha `pecEnabled=true`, compaiono i campi PEC: uno o più `PecRecipient` con `contesto` coerente (`deposito` o `scp`). Se la modalità non è PEC, i campi PEC restano nascosti e non obbligatori. **PEC deposito e PEC SCP sono separate** perché appartengono a fasi diverse.

## Codice istanza — generazione

Formato: `AAAAMMGG` (da `dataUdienza`) + sigla configurabile (default `NP`) + progressivo annuale a 3 cifre. Esempio: `20260517NP001`. Il progressivo è per anno di riferimento. La generazione deve essere atomica e anti-duplicato (transazione + controllo univocità). La sigla è un'impostazione, non una costante nel codice.

## Coerenza degli stati (guard)

Le transizioni invalide non esistono nel grafo, quindi non producono pulsanti. In più, vincoli di business espliciti nel service, es.: non si raggiunge una fase `category=liquidated` se non risultano registrati decreto (`decree_received`) e invio SCP (`scp_sent`). I guard stanno nel **service**, non nei componenti.

## Categorie e fasi finali

`category` è l'unico riferimento semantico stabile. Fasi finali standard: `closed, liquidated, refused, annulled`. Le fasi non finali (incluse le personalizzate) sono considerate aperte salvo configurazione contraria, e possono generare alert se superano le soglie temporali.

## Dashboard e alert (derivati dal workflow)

- Card per fase: una card/conteggio per ogni fase con pratiche **attive** in quella fase; le card dinamiche compaiono/scompaiono in base alle pratiche reali.
- Alert: generati per pratica attiva, poi **aggregati in un solo box per pratica** con severità massima (soglie 30/60/90) e più motivazioni nello stesso box. Colori semantici fissi (vedi `06-ui-ux.md`).
- "Vedi pratiche" su una card → apre Pratiche con il filtro di quella fase.

## Eliminazione/disattivazione fasi

Una fase usata da pratiche attive non si elimina: si disattiva. Una fase disattivata senza pratiche attive non compare più nei riepiloghi ordinari. Le transizioni verso fasi inattive sono escluse.

## Compatibilità con campi esistenti

Aggiungere un nuovo `FieldDef` (generale o di fase) lo rende disponibile anche alle pratiche già esistenti come campo vuoto e compilabile, senza alterare i dati precedenti e senza duplicare pratiche.
