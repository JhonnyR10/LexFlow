# 06 — UI / UX

Interfaccia semplice, minimalista, professionale, usabile da chi non ha competenze tecniche. Navigazione immediata.

## Navigazione (sidebar, ordine)

1. Dashboard
2. Pratiche
3. Report
4. Impostazioni istanze
5. Impostazioni app
6. Cestino

(Le anagrafiche Professionisti e Collaboratori vivono come card dentro Impostazioni istanze.)

## Temi

L'utente sceglie il tema in Impostazioni app (es. chiaro, scuro, pastello, deep dark, grigio senape). Il tema cambia sfondo, card, bordi, testo, accenti, sidebar, input e pulsanti.

### Colori semantici NON sovrascrivibili dal tema

Devono restare riconoscibili in qualsiasi tema:
- alert **giallo** (oltre 30 giorni)
- alert **arancione** (oltre 60 giorni)
- alert **rosso** (oltre 90 giorni)
- **errori**
- **azioni distruttive** (cestina, cancella definitivamente, reset)
- **stati critici**

Implementazione: definire questi colori come token semantici separati dai token di tema, così che i temi non possano ridefinirli.

## Dashboard

- Centro di controllo, **non** di inserimento dati.
- Card di conteggio per fase (dinamiche: solo fasi con pratiche attive).
- Alert: **un solo box per pratica**, severità = massima tra le soglie, più motivazioni nello stesso box. Esempio: "Pratica aperta ferma da 111 giorni dalla data deposito; decreto ricevuto ma non ancora inviato a SCP."
- "Giorni dalla data deposito: X"; se manca → "Data deposito non presente".
- Card anzianità (pratiche aperte più vecchie), documenti mancanti.
- "Vedi pratiche" su una card → apre Pratiche con filtro coerente.
- Esclude sempre le pratiche cestinate.
- Stato vuoto: "Archivio vuoto. Puoi iniziare creando una nuova pratica oppure ripristinare un backup." Mai mostrare dati mock come reali.

## Pratiche (tabella)

- Mostra solo pratiche attive.
- Colonne dati rispettano `visibleInTable` della config; colonne operative sempre presenti: checkbox, codice istanza, Apri, azioni.
- **Codice istanza cliccabile** = stesso effetto del pulsante Apri (stile link, hover, pointer). Regola valida ovunque ci sia un Apri (anche nel Cestino).
- Selezione multipla con checkbox, limitata alle righe filtrate; checkbox "seleziona tutto" seleziona solo il filtrato.
- Stato vuoto e stato filtrato-vuoto distinti e chiari.

## Dettaglio pratica

Sezioni: intestazione (codice, nome, fase corrente, alert), dati generali, soggetti collegati, importi (+ differenze), workflow (pulsanti dinamici), form dinamico di fase, storico/timeline, documenti, controlli ("decreto mancante", ecc.). Pulsante Modifica pratica.

## Cestino

- Tabella pratiche cestinate con data e motivo cestinazione.
- Messaggio di avviso in testa.
- Conferma prima di spostare nel cestino (con motivo). Conferma forte e separata per la cancellazione definitiva (irreversibile).
- Ripristino singolo e multiplo.

## Assistente (post-MVP)

Pulsante flottante in basso a **sinistra** (per non coprire azioni in basso a destra). Si ritrae/nasconde su modali critiche. Non interferisce con salvataggi/backup/reset/form.

## Responsive / layout

Su schermi piccoli, i layout a due colonne (es. elenco + dettaglio nelle card anagrafiche) passano a impilati verticalmente. Tabelle leggibili, pulsanti chiari, filtri ben organizzati, maschere ordinate per sezione.

## Stati e messaggi

Sempre presenti e curati: loading, empty (messaggio utile e azione suggerita), error (messaggio chiaro, eventuale retry). Nessun valore tecnico grezzo esposto all'utente.
