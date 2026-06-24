# 08 — Metodo di lavoro (Ways of Working)

Questa guida institutionalizza il processo di collaborazione tra l'utente e Claude Code su LexFlow. È vincolante come CLAUDE.md.

---

## 1. Principio: il repository è l'unica fonte di verità

Il progetto esiste in un solo posto: il repository Git. Non esistono documenti "alternativi" validi al di fuori di `docs/`. Qualunque decisione presa in chat, email o a voce vale **zero** finché non è scritta in un file di `docs/` e committata.

**Corollario:** Claude Code scrive tutta la documentazione tecnica. L'utente approva, corregge, chiede cambiamenti. La fonte di verità rimane il file — non il riassunto della conversazione.

**Ordine di priorità in caso di conflitto:**
1. `docs/07-workflow-tree.md` — albero canonico del workflow (prevale su tutto per il dominio)
2. `docs/02-data-model.md` e `docs/03-workflow-engine.md` — specifica tecnica aggiornata
3. `docs/00-backlog-mvp.md` — storie e criteri d'accettazione
4. `CLAUDE.md` — regole di processo
5. Codice — implementazione (mai fonte di verità; si allinea ai doc, non viceversa)

Se un documento dice X e il codice fa Y, il codice è sbagliato. Si corregge il codice, non il documento.

---

## 2. Processo storia-per-storia

Ogni storia del backlog (`docs/00-backlog-mvp.md`) segue questi passi in sequenza. Claude Code non salta passaggi né avanza alla storia successiva senza conferma esplicita dell'utente.

### Passi

**0. Lettura iniziale (prima di ogni sessione)**
   - Leggi `docs/PROGRESS.md` — per sapere dove siamo
   - Leggi `CLAUDE.md` — per le regole di processo
   - Leggi il documento specifico della storia (indicato nel backlog)
   - Non iniziare a scrivere codice finché la storia non è capita

**1. Piano (se la storia è non banale)**
   - Elenca i file da creare/modificare
   - Elenca le invarianti da implementare
   - Elenca i rischi (es. reset DB necessario, rottura interfacce condivise)
   - Chiedi conferma **prima** di procedere (usa Plan Mode se la storia è complessa)

**2. Documentazione prima del codice**
   - Se la storia cambia un requisito o modifica il modello dati, aggiorna il doc corrispondente **prima** di scrivere codice
   - Non lasciare mai codice che diverge dalla specifica

**3. Implementazione**
   - Un file alla volta, layer rispettati (controller → service → repository)
   - Nessun `any`, nessun salto di layer
   - Validazione zod su entrambi i lati (renderer e main)

**4. Verifica**
   - `npm run typecheck` — deve essere verde
   - `npm run build` — deve essere verde
   - `npm run desktop` — avvia l'app, verifica manualmente la funzionalità
   - Verifica funzionalità preesistenti: nessuna regressione

**5. Aggiornamento PROGRESS.md**
   - Stato della storia: FATTO
   - Lista file modificati/creati
   - Invarianti implementate (se rilevanti)
   - Decisioni prese o aperte
   - Verifiche eseguite (typecheck ✓ / build ✓ / desktop ✓)

**6. Commit Git**
   - Messaggio imperativo, specifico: descrive cosa cambia e perché
   - Non committare segreti, `node_modules`, DB locale, build artifact

**7. Conferma utente**
   - Claude Code aspetta conferma esplicita prima di iniziare la storia successiva
   - Non avanzare in autonomia nemmeno se la build è verde

---

## 3. Definition of Done (per storia)

Una storia è FATTA se e solo se **tutti** i criteri seguenti sono soddisfatti:

- [ ] `npm run typecheck` verde (zero errori TS)
- [ ] `npm run lint` verde (zero warning ESLint bloccanti)
- [ ] `npm run build` verde (produzione compilata)
- [ ] `npm run desktop` verde (app si avvia, funzionalità principale funziona)
- [ ] Funzionalità preesistenti integre (nessuna regressione visibile)
- [ ] Layer rispettati: nessuna query fuori dai repository, nessuna business logic nei controller o nei componenti
- [ ] Nessun `any` nel codice nuovo
- [ ] Stati UI loading/empty/error gestiti per ogni vista che carica dati
- [ ] `HistoryEvent` scritto dove pertinente (ogni operazione rilevante su pratiche)
- [ ] Doc in `docs/` aggiornato se il requisito è cambiato (prima del codice)
- [ ] `docs/PROGRESS.md` aggiornato (stato + log modifiche + verifiche)
- [ ] Commit Git con messaggio chiaro
- [ ] Conferma esplicita dell'utente ricevuta

---

## 4. Euristiche operative

**Quando chiedere, quando agire:**
- Se la storia è chiara e il rischio è basso → agisci, poi riferisci
- Se la storia implica un reset DB, una migrazione distruttiva, la rottura di interfacce condivise, o c'è ambiguità sui requisiti → fermati, spiega il piano, chiedi conferma
- Se la specifica è contraddittoria tra due doc → segnala il conflitto, aspetta

**Modifiche non richieste:**
- Non riscrivere parti di codice non toccate dalla storia
- Non aggiungere feature non richieste ("sarebbe utile anche…")
- Non introdurre astrazioni premature (tre righe simili sono meglio di un'astrazione che non serve)

**Errori e blocchi:**
- Se un comando fallisce (typecheck, build), analizza l'errore e correggilo prima di riferire
- Se sei bloccato e non hai una soluzione chiara, spiega il blocco con dettaglio invece di tentare soluzioni casuali
- Non usare workaround distruttivi (`--no-verify`, `@ts-ignore` senza commento, `any`) per far passare una build

**Sicurezza:**
- Mai hardcodare percorsi: usa `app.getPath('userData')` e `path.join()`
- Mai esporre dati sensibili (keytar, DB path, credenziali) nei log di sviluppo
- Nessuna query SQL grezza fuori da Drizzle ORM

---

## 5. Audit di coerenza (quando e come)

L'audit confronta i documenti di specifica con il codice reale e rileva le divergenze. Va eseguito:
- A inizio sessione dopo un lungo gap o dopo un refactor significativo
- Prima di iniziare un'epica nuova che si appoggia a quella precedente
- Ogni volta che l'utente lo richiede esplicitamente

**Cosa fa l'audit:**
1. Legge tutti i doc rilevanti (`docs/`, `CLAUDE.md`)
2. Legge il codice reale (schema, service, controller, componenti)
3. Produce una lista di divergenze (doc dice X, codice fa Y)
4. Non corregge nulla in autonomia — presenta le lacune all'utente, che decide

**Esempi storici di divergenze trovate in audit (per calibrare cosa cercare):**

| Divergenza | Doc errato | Codice corretto | Risoluzione |
|---|---|---|---|
| `FieldDef.scope` | `00-backlog-mvp.md` diceva `general\|phase` | codice usa `general\|transition` | Aggiornare backlog |
| `Phase.pecEnabled` | `00-backlog-mvp.md` S1.1 citava `pecEnabled` | rimosso in S0.4 | Aggiornare backlog |
| `PhaseRecord` vs `TransitionRecord` | `00-backlog-mvp.md` | `02-data-model.md` e codice usano `TransitionRecord` | Allineare backlog |
| Struttura cartelle `dto.ts`/`validation.ts` | `01-architecture.md` | non esistono; validazione è inline nel controller | Allineare architettura o annotare come aspirazionale |
| `FieldDef.type` senza `pec` | `00-backlog-mvp.md` §2 | aggiunto in S1.5 | Aggiornare backlog |

**Regola:** quando l'audit trova una divergenza, il doc più recente e aggiornato prevale (di solito `02-data-model.md`, `03-workflow-engine.md`, `07-workflow-tree.md`). Il backlog (`00-backlog-mvp.md`) tende ad essere meno aggiornato perché non viene aggiornato ad ogni storia.

---

## 6. Uso del Plan Mode

**Quando usarlo:**
- Storie con più di 5 file da modificare
- Storie che cambiano lo schema del DB (migrazione necessaria)
- Storie che introducono nuovi layer o interfacce IPC
- Storie che hanno dipendenze non ovvie tra componenti diversi
- Quando l'utente dice "pianifica prima di fare"

**Come funziona:**
1. Claude Code entra in Plan Mode (nessun codice scritto)
2. Produce il piano: file da toccare, ordine, rischi, decisioni da prendere
3. L'utente approva, corregge o annulla
4. Solo dopo l'approvazione si esce dal Plan Mode e si inizia l'implementazione

**Quando NON usarlo:**
- Storie semplici con 1-2 file e invarianti chiari
- Fix di bug isolati
- Aggiornamenti di documentazione puri

---

## 7. Policy sulla revisione esterna

- Le revisioni di codice avvengono tramite Pull Request su GitHub
- Claude Code prepara il PR con descrizione chiara (cosa, perché, come testare)
- Nessun merge senza conferma dell'utente
- Se un revisore esterno (es. `/code-review ultra`) trova problemi, li si affronta nella sessione successiva come storia di qualità (`S13.*`)
- I suggerimenti di refactoring non richiesti dalla storia in corso vengono annotati in PROGRESS.md come "TODO futuro" e non implementati immediatamente

---

*Documento creato il 2026-06-24. Aggiornare se il metodo di lavoro cambia.*
