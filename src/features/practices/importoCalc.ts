// S6.2 — Differenze e % riduzione calcolate al volo dai quattro importi.
// Nessun valore persistito (vedi docs/02-data-model.md §Calcoli derivati): se un
// operando manca → null, che la UI rende come "Non calcolabile". Mai NaN.

export interface ImportoDifferences {
  riduzioneRichiestoConcesso: number | null // richiesto − concesso
  percentualeRiduzione: number | null        // (richiesto − concesso) / richiesto × 100
  diffConcessoFatturato: number | null        // concesso − fatturato
  diffFatturatoLiquidato: number | null       // fatturato − liquidato
  diffConcessoLiquidato: number | null        // concesso − liquidato
}

export interface ImportiInput {
  importoRichiesto: number | null
  importoConcesso: number | null
  importoFatturato: number | null
  importoLiquidato: number | null
}

// Differenza tra due operandi: null se uno manca o non è finito.
function diff(a: number | null, b: number | null): number | null {
  if (a == null || b == null || !Number.isFinite(a) || !Number.isFinite(b)) return null
  return a - b
}

export function computeImportoDifferences(i: ImportiInput): ImportoDifferences {
  const { importoRichiesto, importoConcesso, importoFatturato, importoLiquidato } = i

  // % riduzione: richiede entrambi gli operandi e richiesto ≠ 0 (evita la divisione
  // per zero → null, niente NaN/Infinity).
  const percentualeRiduzione =
    importoRichiesto == null ||
    importoConcesso == null ||
    !Number.isFinite(importoRichiesto) ||
    !Number.isFinite(importoConcesso) ||
    importoRichiesto === 0
      ? null
      : ((importoRichiesto - importoConcesso) / importoRichiesto) * 100

  return {
    riduzioneRichiestoConcesso: diff(importoRichiesto, importoConcesso),
    percentualeRiduzione,
    diffConcessoFatturato: diff(importoConcesso, importoFatturato),
    diffFatturatoLiquidato: diff(importoFatturato, importoLiquidato),
    diffConcessoLiquidato: diff(importoConcesso, importoLiquidato),
  }
}
