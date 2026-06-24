---
name: project-s11-shell-phases
description: S1.1 completata — guscio applicativo (HashRouter, sidebar, 6 pagine) + CRUD Fasi con guard. Dipendenze react-router-dom v7 e @tanstack/react-query v5 aggiunte.
metadata:
  type: project
---

S1.1 FATTO (2026-06-24): guscio applicativo + CRUD Fasi completo.

**Why:** prima storia della fase E1 (workflow engine configurabile), prerequisito per tutte le storie successive di configurazione workflow.

**How to apply:** la prossima storia è S1.2 (CRUD Transizioni). Segue lo stesso pattern layer: IPC types in shared/ipc.ts → repository → service → controller → preload → api/config.ts → feature hook + componenti UI.

Struttura feature config: `src/features/config/<dominio>/use<Dominio>.ts` + componenti.

Note tecniche:
- Guard pratiche in `assertCanDeactivate` è TODO documentato (attende tabella practices, S4)
- Delete fisica fasi rinviata per FK con transitions
- Errori IPC Electron puliti via `src/utils/ipcError.ts`
- Transazioni Drizzle usano `getDb().transaction((tx) => {...})` con `tx` esplicito
