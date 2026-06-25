import React, { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useMenuSets } from '../config/menus/useMenus'
import { useFields } from '../config/fields/useFields'
import { useAllProfessionisti } from '../anagrafiche/professionisti/useProfessionisti'
import { useAllCollaboratori } from '../anagrafiche/collaboratori/useCollaboratori'
import { useCreatePractice } from './usePractices'
import { practicesApi } from '../../api/practices'
import { ipcErrorMessage } from '../../utils/ipcError'
import { DynamicField, PecBlock } from './dynamicFields'
import { getMenuOptions } from './menuHelpers'
import type { FieldDefListItem } from '../../../shared/ipc'

// ---- Validazione renderer ----
const formSchema = z.object({
  dataUdienza: z
    .string()
    .min(1, 'La data di udienza è obbligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato non valido (YYYY-MM-DD)'),
  codiceIstanza: z.string().optional(),
  nomeIstanza: z.string().optional(),
  pecDestinatari: z.array(z.string()).optional(),
})

interface Props {
  onClose: () => void
  onCreated: (id: number, codiceIstanza: string) => void
}

// ---- Stili ----
const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  zIndex: 1000, paddingTop: '40px', paddingBottom: '40px', overflowY: 'auto'
}
const dialogStyle: React.CSSProperties = {
  background: 'var(--color-surface)', borderRadius: '10px',
  padding: '28px 32px', width: '600px', maxWidth: '95vw',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)', flexShrink: 0
}
const titleStyle: React.CSSProperties = {
  fontSize: '17px', fontWeight: 600, marginBottom: '24px', color: 'var(--color-text)'
}
const sectionTitleStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--color-text-muted)',
  marginBottom: '10px', marginTop: '20px',
  paddingBottom: '6px', borderBottom: '1px solid var(--color-border)'
}
const rowStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'
}
const fieldStyle: React.CSSProperties = { marginBottom: '12px' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 500,
  marginBottom: '4px', color: 'var(--color-text)'
}
const requiredDot: React.CSSProperties = { color: 'var(--color-error)', marginLeft: '2px' }
const hintStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)',
  borderRadius: '6px', fontSize: '13px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box'
}
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit'
}
const errorStyle: React.CSSProperties = {
  marginBottom: '14px', padding: '8px 12px',
  background: 'var(--color-error-bg)', border: '1px solid var(--color-error-border)',
  borderRadius: '6px', color: 'var(--color-error)', fontSize: '13px'
}
const footerStyle: React.CSSProperties = {
  display: 'flex', gap: '10px', justifyContent: 'flex-end',
  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)'
}
const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'var(--color-accent)', color: '#fff',
  border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'
}
const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 18px', background: 'var(--color-bg)', color: 'var(--color-text)',
  border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
}
// ---- Componente principale ----
export function NuovaPraticaModal({ onClose, onCreated }: Props): React.JSX.Element {
  const { data: menuSets = [], isLoading: loadingMenus } = useMenuSets()
  const { data: professionisti = [], isLoading: loadingProf } = useAllProfessionisti()
  const { data: collaboratori = [], isLoading: loadingCollab } = useAllCollaboratori()
  const { data: generalFields = [], isLoading: loadingFields } = useFields({ scope: 'general' })
  const createPractice = useCreatePractice()

  // Campi fissi
  const [dataUdienza,         setDataUdienza]         = useState('')
  const [codiceIstanza,       setCodiceIstanza]       = useState('')
  const [codiceManual,        setCodiceManual]        = useState(false)  // true = utente ha modificato il codice manualmente
  const [nomeIstanza,         setNomeIstanza]         = useState('')
  const [nomeManual,          setNomeManual]          = useState(false)
  const [professionistaId,    setProfessionistaId]    = useState<string>('')
  const [collaboratoreId,     setCollaboratoreId]     = useState<string>('')
  const [tipologiaAttivita,   setTipologiaAttivita]   = useState('')
  const [competenza,          setCompetenza]          = useState('')
  const [autoritaGiudiziaria, setAutoritaGiudiziaria] = useState('')
  const [dataDeposito,        setDataDeposito]        = useState('')
  const [modalitaDeposito,    setModalitaDeposito]    = useState('')
  const [importoRichiesto,    setImportoRichiesto]    = useState('')
  const [note,                setNote]                = useState('')
  const [pecDestinatari,      setPecDestinatari]      = useState<string[]>([])

  // Campi custom generali
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({})

  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isPec = modalitaDeposito === 'pec'

  // Aggiorna codice preview quando cambia dataUdienza (se l'utente non ha modificato manualmente)
  useEffect(() => {
    if (!dataUdienza || !/^\d{4}-\d{2}-\d{2}$/.test(dataUdienza)) return
    if (codiceManual) return
    practicesApi.generateCodiceIstanza({ dataUdienza })
      .then(res => setCodiceIstanza(res.codice))
      .catch(() => {/* ignora errori di preview */})
  }, [dataUdienza, codiceManual])

  // Cambio data udienza: aggiorna la data e, se l'utente non ha modificato a
  // mano il nome istanza, lo rigenera in linea (niente setState-in-effect).
  const handleDataUdienzaChange = useCallback((val: string): void => {
    setDataUdienza(val)
    if (!nomeManual && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      setNomeIstanza(`${val.replace(/-/g, '')}_NOTA_SPESE`)
    }
  }, [nomeManual])

  const handleCodiceChange = useCallback((val: string): void => {
    setCodiceIstanza(val)
    setCodiceManual(true)
  }, [])

  const handleNomeChange = useCallback((val: string): void => {
    setNomeIstanza(val)
    setNomeManual(true)
  }, [])

  const handleCustomChange = useCallback((key: string, value: unknown): void => {
    setCustomValues(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    const parsed = formSchema.safeParse({ dataUdienza, codiceIstanza, nomeIstanza, pecDestinatari })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dati non validi')
      return
    }

    // Filtra indirizzi PEC vuoti
    const pec = isPec ? pecDestinatari.filter(a => a.trim() !== '') : []

    setLoading(true)
    try {
      const result = await createPractice.mutateAsync({
        codiceIstanza:       codiceIstanza || undefined,
        nomeIstanza:         nomeIstanza || undefined,
        collaboratoreId:     collaboratoreId ? parseInt(collaboratoreId, 10) : null,
        professionistaId:    professionistaId ? parseInt(professionistaId, 10) : null,
        tipologiaAttivita:   tipologiaAttivita || undefined,
        dataUdienza,
        competenza:          competenza || undefined,
        autoritaGiudiziaria: autoritaGiudiziaria || undefined,
        dataDeposito:        dataDeposito || undefined,
        modalitaDeposito:    modalitaDeposito || undefined,
        importoRichiesto:    importoRichiesto !== '' ? parseFloat(importoRichiesto) : null,
        note:                note || undefined,
        customValues,
        pecDestinatari:      pec.length > 0 ? pec : undefined,
      })
      onCreated(result.id, result.codiceIstanza)
    } catch (err) {
      setError(ipcErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const isDataLoading = loadingMenus || loadingProf || loadingCollab || loadingFields

  const activeGeneralFields = (generalFields as FieldDefListItem[]).filter(f => f.isActive)

  return (
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={dialogStyle} onMouseDown={e => e.stopPropagation()}>
        <div style={titleStyle}>Nuova pratica</div>

        {isDataLoading && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Caricamento dati in corso…
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ---- Sezione 1: Codice / Udienza ---- */}
          <div style={sectionTitleStyle}>Codice istanza e udienza</div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Data udienza<span style={requiredDot}>*</span>
            </label>
            <input
              style={inputStyle}
              type="date"
              value={dataUdienza}
              onChange={e => handleDataUdienzaChange(e.target.value)}
              required
            />
          </div>

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Codice istanza</label>
              <input
                style={inputStyle}
                type="text"
                value={codiceIstanza}
                onChange={e => handleCodiceChange(e.target.value)}
                placeholder="auto-generato"
              />
              <p style={hintStyle}>Generato automaticamente dalla data di udienza. Modificabile.</p>
            </div>
            <div>
              <label style={labelStyle}>Nome istanza</label>
              <input
                style={inputStyle}
                type="text"
                value={nomeIstanza}
                onChange={e => handleNomeChange(e.target.value)}
                placeholder="auto-generato"
              />
              <p style={hintStyle}>Auto-generato come AAAAMMGG_NOTA_SPESE. Modificabile.</p>
            </div>
          </div>

          {/* ---- Sezione 2: Soggetti ---- */}
          <div style={sectionTitleStyle}>Soggetti</div>

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Professionista</label>
              <select style={selectStyle} value={professionistaId}
                onChange={e => setProfessionistaId(e.target.value)}>
                <option value="">— nessuno —</option>
                {(professionisti as { id: number; denominazione: string; isActive: boolean }[])
                  .filter(p => p.isActive)
                  .map(p => <option key={p.id} value={p.id}>{p.denominazione}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Collaboratore</label>
              <select style={selectStyle} value={collaboratoreId}
                onChange={e => setCollaboratoreId(e.target.value)}>
                <option value="">— nessuno —</option>
                {(collaboratori as { id: number; denominazione: string; isActive: boolean }[])
                  .filter(c => c.isActive)
                  .map(c => <option key={c.id} value={c.id}>{c.denominazione}</option>)}
              </select>
            </div>
          </div>

          {/* ---- Sezione 3: Dati istanza ---- */}
          <div style={sectionTitleStyle}>Dati istanza</div>

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Tipologia attività</label>
              <select style={selectStyle} value={tipologiaAttivita}
                onChange={e => setTipologiaAttivita(e.target.value)}>
                <option value="">— seleziona —</option>
                {getMenuOptions(menuSets, 'tipologia_attivita').map(o =>
                  <option key={o.id} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Competenza</label>
              <select style={selectStyle} value={competenza}
                onChange={e => setCompetenza(e.target.value)}>
                <option value="">— seleziona —</option>
                {getMenuOptions(menuSets, 'competenza').map(o =>
                  <option key={o.id} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Autorità giudiziaria</label>
            <select style={selectStyle} value={autoritaGiudiziaria}
              onChange={e => setAutoritaGiudiziaria(e.target.value)}>
              <option value="">— seleziona —</option>
              {getMenuOptions(menuSets, 'autorita_giudiziaria').map(o =>
                <option key={o.id} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* ---- Sezione 4: Deposito ---- */}
          <div style={sectionTitleStyle}>Deposito</div>

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Data deposito</label>
              <input style={inputStyle} type="date" value={dataDeposito}
                onChange={e => setDataDeposito(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Modalità deposito</label>
              <select style={selectStyle} value={modalitaDeposito}
                onChange={e => setModalitaDeposito(e.target.value)}>
                <option value="">— seleziona —</option>
                {getMenuOptions(menuSets, 'modalita_deposito').map(o =>
                  <option key={o.id} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {isPec && (
            <div style={fieldStyle}>
              <label style={labelStyle}>Destinatari PEC deposito</label>
              <PecBlock addresses={pecDestinatari} onChange={setPecDestinatari} />
            </div>
          )}

          {/* ---- Sezione 5: Importo ---- */}
          <div style={sectionTitleStyle}>Importo</div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Importo richiesto (€)</label>
            <input
              style={inputStyle}
              type="number"
              step="0.01"
              min="0"
              value={importoRichiesto}
              onChange={e => setImportoRichiesto(e.target.value)}
              placeholder="0,00"
            />
          </div>

          {/* ---- Sezione 6: Note ---- */}
          <div style={sectionTitleStyle}>Note</div>

          <div style={fieldStyle}>
            <textarea style={textareaStyle} value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note libere sulla pratica…" />
          </div>

          {/* ---- Sezione 7: Campi aggiuntivi (dinamici) ---- */}
          {activeGeneralFields.length > 0 && (
            <>
              <div style={sectionTitleStyle}>Campi aggiuntivi</div>
              {activeGeneralFields.map(field => (
                <DynamicField
                  key={field.id}
                  field={field}
                  value={customValues[field.key]}
                  onChange={handleCustomChange}
                  allFields={activeGeneralFields}
                  customValues={customValues}
                  menuSets={menuSets}
                />
              ))}
            </>
          )}

          {/* ---- Errore ---- */}
          {error && <div style={errorStyle}>{error}</div>}

          {/* ---- Footer ---- */}
          <div style={footerStyle}>
            <button type="button" style={btnSecondaryStyle} onClick={onClose} disabled={loading}>
              Annulla
            </button>
            <button
              type="submit"
              style={{ ...btnPrimaryStyle, opacity: loading ? 0.7 : 1 }}
              disabled={loading || isDataLoading}
            >
              {loading ? 'Salvataggio…' : 'Crea pratica'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
