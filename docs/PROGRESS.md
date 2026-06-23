# PROGRESS — Stato del progetto LexFlow

File **vivo**: traccia avanzamento, decisioni e modifiche. Distinto dalla specifica (`CLAUDE.md` + `docs/*` di riferimento). Claude Code lo legge a inizio sessione e lo aggiorna a fine di ogni storia.

Legenda stato: `TODO` · `IN CORSO` · `FATTO` · `BLOCCATO`

---

## Stato avanzamento (per storia del backlog)

| Storia | Descrizione | Stato | Note |
|---|---|---|---|
| S0.1 | Scaffolding Electron+React+TS+Vite+better-sqlite3+Drizzle | TODO | |
| S0.2 | Bridge IPC tipizzato | TODO | |
| S0.3 | Config zod + logging strutturato | TODO | |
| S0.4 | Migrazioni Drizzle + seed (fasi/menu standard) | TODO | |
| S1.1 | CRUD fasi | TODO | |
| S1.2 | CRUD transizioni | TODO | |
| S1.3 | CRUD campi generali e campi fase | TODO | |
| S1.4 | CRUD menu a tendina | TODO | |
| S1.5 | Regola PEC condizionale | TODO | |
| S2.1 | CRUD Professionisti | TODO | |
| S2.2 | CRUD Collaboratori | TODO | |
| S3.1 | Tabella pratiche attive | TODO | |
| S3.2 | Ricerca globale | TODO | |
| S3.3 | Filtri base | TODO | |
| S3.4 | Ordinamento + selezione multipla | TODO | |
| S4.1 | Generazione codice istanza | TODO | |
| S4.2 | Form Nuova pratica | TODO | |
| S4.3 | Modifica pratica + storico | TODO | |
| S5.1 | Dettaglio pratica | TODO | |
| S5.2 | Pulsanti dinamici = transizioni | TODO | |
| S5.3 | Form dinamico fase + salvataggio | TODO | |
| S5.4 | Guard coerenza stati | TODO | |
| S5.5 | Storico/timeline | TODO | |
| S6.1 | Quattro importi | TODO | |
| S6.2 | Differenze calcolate | TODO | |
| S7.1 | Documenti decreto+fattura | TODO | |
| S8.1 | Card per fase dinamiche | TODO | |
| S8.2 | Alert aggregato per pratica | TODO | |
| S8.3 | Giorni da deposito | TODO | |
| S8.4 | Anzianità + stato vuoto + Vedi pratiche | TODO | |
| S9.1 | Export CSV | TODO | |
| S10.1 | Sposta nel cestino | TODO | |
| S10.2 | Ripristino | TODO | |
| S10.3 | Cancellazione definitiva | TODO | |
| S11.1 | Tema + colori semantici fissi | TODO | |
| S11.2 | Percorso dati | TODO | |
| S11.3 | Backup completo + ripristino | TODO | |
| S11.4 | Reset con backup automatico | TODO | |
| S11.7 | Backup automatico periodico + rotazione | TODO | MVP (deciso 2026-06-23) |
| S13.* | Qualità trasversale (errori/loading/empty/PEC) | TODO | |

(Storie post-MVP non elencate finché non promosse: report avanzati, assistente, numeri procedimento multipli, ecc.)

---

## Log decisioni

Ogni riga: data — decisione — motivo.

- 2026-06-23 — Desktop locale mono-utente (Electron + SQLite). — Uso su singolo PC, un solo amministratore.
- 2026-06-23 — Workflow configurabile già in MVP. — Richiesta esplicita del committente.
- 2026-06-23 — DB: better-sqlite3-multiple-ciphers + Drizzle (no Prisma). — Packaging Prisma in Electron fragile; driver cifrabile fin da subito per evitare migrazione quando si abiliterà la cifratura (post-MVP).
- 2026-06-23 — Confine renderer↔main via bridge IPC tipizzato (no server HTTP). — Over-engineering per mono-utente locale.
- 2026-06-23 — Sigla codice istanza configurabile (default NP); documenti su filesystem; numeri procedimento e percorso condiviso fuori MVP. — Assunzioni ratificate dal committente.
- 2026-06-23 — Backup automatico periodico **in MVP** (E11.7). — Rischio perdita dati su app locale senza cloud.
- 2026-06-23 — Protezione dati (lock + cifratura DB) **post-MVP** (E14); driver cifrabile già in E0, cifratura spenta. — Dati sensibili (collaboratori di giustizia), ma non bloccante per MVP.
- 2026-06-23 — Scadenzario (E15) ed export PDF scheda pratica (E16) **post-MVP**. — Utili, non urgenti.

## Decisioni aperte / da confermare

- Sigla codice fissa o configurabile (assunta configurabile).
- Documenti su filesystem vs blob in DB (assunto filesystem).

---

## Log modifiche

Registro cronologico degli interventi rilevanti di Claude Code (cosa è cambiato, dove). Aggiungere una voce a fine storia.

- (vuoto — il progetto non è ancora iniziato)
