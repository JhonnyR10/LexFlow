---
name: project_s14_menus
description: S1.4 CRUD menu a tendina — FATTO. 7 canali IPC, UI due livelli, invarianti key/value immutabili.
metadata:
  type: project
---

S1.4 CRUD Menu a tendina completata il 2026-06-24.

**Why:** Il seed aveva già i 5 set standard (S0.4). L'implementazione aggiunge solo il layer IPC + UI.

**How to apply:** La chiave tecnica del set è generata con `slugify(label)` e non è mai aggiornabile. Il value dell'opzione è immutabile dopo la creazione — solo la label è editabile. Delete fisica rinviata a post-pratiche (TODO in service.ts).

**Invarianti chiave:**
- `key` del set: unica e immutabile (slug auto-generato alla creazione)
- `value` dell'opzione: unico per set, immutabile dopo creazione
- TODO guard: non disattivare opzione in uso da pratiche (vedi `service.ts`)

**File principali:** `src/features/config/menus/` (useMenus, MenuSetFormModal, MenuOptionFormModal, MenusSection)

Relazioni: [[project_s12_transitions]] [[project_s11_shell_phases]]
