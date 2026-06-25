import React, { useState, useCallback } from 'react'
import { z } from 'zod'
import { useMenuSets } from '../config/menus/useMenus'
import { useFields } from '../config/fields/useFields'
import { useAllProfessionisti } from '../anagrafiche/professionisti/useProfessionisti'
import { useAllCollaboratori } from '../anagrafiche/collaboratori/useCollaboratori'
import { useUpdatePractice } from './usePractices'
import { ipcErrorMessage } from '../../utils/ipcError'
import { DynamicField, PecBlock } from './dynamicFields'
import { getMenuOptions } from './menuHelpers'
import {
  overlayStyle, dialogStyle, titleStyle, sectionTitleStyle, rowStyle, fieldStyle,
  labelStyle, requiredDot, hintStyle, inputStyle, selectStyle, textareaStyle,
  errorStyle, footerStyle, btnPrimaryStyle, btnSecondaryStyle, readonlyInputStyle,
} from './practiceFormStyles'
import type { FieldDefListItem, PracticeDetail } from '../../../shared/ipc'

// ---- Validazione renderer ----
const formSchema = z.object({
  dataUdienza: z
    .string()
    .min(1, 'La data di udienza è obbligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato non valido (YYYY-MM-DD)'),
})

interface Props {
  practice: PracticeDetail
  onClose: () => void
  onUpdated: (changed: boolean) => void
}

// ---- Componente principale ----
export function ModificaPraticaModal({ practice, onClose, onUpdated }: Props): React.JSX.Element {
  const { data: menuSets = [], isLoading: loadingMenus } = useMenuSets()
  const { data: professionisti = [], isLoading: loadingProf } = useAllProfessionisti()
  const { data: collaboratori = [], isLoading: loadingCollab } = useAllCollaboratori()
  const { data: generalFields = [], isLoading: loadingFields } = useFields({ scope: 'general' })
  const updatePractice = useUpdatePractice(practice.id)

  // Campi fissi pre-riempiti dalla pratica esistente.
  const [nomeIstanza,         setNomeIstanza]         = useState(practice.nomeIstanza)
  const [professionistaId,    setProfessionistaId]    = useState<string>(practice.professionistaId != null ? String(practice.professionistaId) : '')
  const [collaboratoreId,     setCollaboratoreId]     = useState<string>(practice.collaboratoreId != null ? String(practice.collaboratoreId) : '')
  const [tipologiaAttivita,   setTipologiaAttivita]   = useState(practice.tipologiaAttivita ?? '')
  const [dataUdienza,         setDataUdienza]         = useState(practice.dataUdienza ?? '')
  const [competenza,          setCompetenza]          = useState(practice.competenza ?? '')
  const [autoritaGiudiziaria, setAutoritaGiudiziaria] = useState(practice.autoritaGiudiziaria ?? '')
  const [dataDeposito,        setDataDeposito]        = useState(practice.dataDeposito ?? '')
  const [modalitaDeposito,    setModalitaDeposito]    = useState(practice.modalitaDeposito ?? '')
  const [importoRichiesto,    setImportoRichiesto]    = useState(practice.importoRichiesto != null ? String(practice.importoRichiesto) : '')
  const [note,                setNote]                = useState(practice.note ?? '')
  const [pecDestinatari,      setPecDestinatari]      = useState<string[]>(practice.pecDepositoDestinatari)

  // Campi custom generali pre-riempiti.
  const [customValues, setCustomValues] = useState<Record<string, unknown>>(practice.customValues)

  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isPec = modalitaDeposito === 'pec'

  const handleCustomChange = useCallback((key: string, value: unknown): void => {
    setCustomValues(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    const parsed = formSchema.safeParse({ dataUdienza })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Dati non validi')
      return
    }

    const pec = isPec ? pecDestinatari.filter(a => a.trim() !== '') : []

    setLoading(true)
    try {
      const result = await updatePractice.mutateAsync({
        id:                  practice.id,
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
        pecDestinatari:      pec,
      })
      onUpdated(result.changed)
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
        <div style={titleStyle}>Modifica pratica</div>

        {isDataLoading && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            Caricamento dati in corso…
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* ---- Sezione 1: Codice / Udienza ---- */}
          <div style={sectionTitleStyle}>Codice istanza e udienza</div>

          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Codice istanza</label>
              <input style={readonlyInputStyle} type="text" value={practice.codiceIstanza} readOnly disabled />
              <p style={hintStyle}>Identità della pratica: non modificabile.</p>
            </div>
            <div>
              <label style={labelStyle}>Nome istanza</label>
              <input
                style={inputStyle}
                type="text"
                value={nomeIstanza}
                onChange={e => setNomeIstanza(e.target.value)}
                placeholder="AAAAMMGG_NOTA_SPESE"
              />
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>
              Data udienza<span style={requiredDot}>*</span>
            </label>
            <input
              style={inputStyle}
              type="date"
              value={dataUdienza}
              onChange={e => setDataUdienza(e.target.value)}
              required
            />
            <p style={hintStyle}>La modifica della data non rigenera il codice istanza.</p>
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
                  .filter(p => p.isActive || String(p.id) === professionistaId)
                  .map(p => <option key={p.id} value={p.id}>{p.denominazione}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Collaboratore</label>
              <select style={selectStyle} value={collaboratoreId}
                onChange={e => setCollaboratoreId(e.target.value)}>
                <option value="">— nessuno —</option>
                {(collaboratori as { id: number; denominazione: string; isActive: boolean }[])
                  .filter(c => c.isActive || String(c.id) === collaboratoreId)
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
              {loading ? 'Salvataggio…' : 'Salva modifiche'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
