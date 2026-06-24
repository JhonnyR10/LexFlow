LEXFLOW — ALBERO COMPLETO DI FASI, TRANSIZIONI E TIMELINE
Versione intuitiva con frecce e percorsi di ritorno

LEGENDA
(F)  = FASE: stato in cui la pratica rimane.
(T)  = TRANSIZIONE: pulsante/azione che l’utente può eseguire.
(TL) = TIMELINE: evento storico registrato dopo l’azione.
↩    = ritorno a una fase già attraversata.
⟳    = azione ripetibile più volte.
✓    = fase finale positiva.
✕    = fase finale negativa.
⏸    = fase temporanea/reversibile.

REGOLA BASE
La pratica ha sempre una sola (F) fase corrente.
Ogni (T) transizione produce sempre un (TL) evento.
Una transizione può:
- lasciare la pratica nella stessa fase;
- spostarla in una fase diversa;
- riportarla a una fase precedente;
- chiuderla definitivamente.

======================================================================
ALBERO GENERALE
======================================================================

CREAZIONE DELLA PRATICA
│
├─► (F) DEPOSITATA
│    │
│    ├─► (TL) Pratica depositata
│    │       Dati:
│    │       - collaboratore
│    │       - professionista
│    │       - data udienza/interrogatorio
│    │       - data deposito
│    │       - modalità deposito
│    │       - importo richiesto
│    │       - PEC, se usata
│    │
│    └─► (T) Passaggio automatico
│         └─► (TL) Pratica posta in attesa di decreto
│              └─► (F) IN ATTESA DI DECRETO
│
└─────────────────────────────────────────────────────────────────────


(F) IN ATTESA DI DECRETO
│
├─► (T) Registra sollecito ⟳
│    ├─► (TL) Sollecito effettuato
│    │       Dati:
│    │       - data sollecito
│    │       - modalità
│    │       - destinatario
│    │       - eventuale esito
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ resta in (F) IN ATTESA DI DECRETO
│
├─► (T) Registra richiesta di integrazione
│    ├─► (TL) Integrazione richiesta
│    │       Dati:
│    │       - data richiesta
│    │       - motivazione
│    │       - termine/scadenza
│    │       - note
│    └─► (F) IN ATTESA DI INTEGRAZIONE
│
├─► (T) Registra decreto
│    ├─► (TL) Decreto ricevuto
│    │       Dati:
│    │       - data ricezione
│    │       - data decreto
│    │       - numero decreto
│    │       - importo concesso
│    │       - note
│    └─► (F) DECRETO RICEVUTO
│
├─► (T) Segna come rifiutata
│    ├─► (TL) Pratica rifiutata
│    │       Dati:
│    │       - data rifiuto
│    │       - motivo
│    │       - note
│    └─► (F) RIFIUTATA ✕
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    │       Dati:
│    │       - data sospensione
│    │       - motivo
│    │       - note
│    │       - fase di provenienza salvata
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) IN ATTESA DI DECRETO
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


======================================================================
RAMO INTEGRAZIONE PRIMA DEL DECRETO
======================================================================

(F) IN ATTESA DI INTEGRAZIONE
│
├─► (T) Registra sollecito integrazione ⟳
│    ├─► (TL) Sollecito integrazione effettuato
│    │       Dati:
│    │       - data
│    │       - modalità
│    │       - destinatario
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ resta in (F) IN ATTESA DI INTEGRAZIONE
│
├─► (T) Aggiorna richiesta / proroga termine ⟳
│    ├─► (TL) Richiesta di integrazione aggiornata
│    │       Dati:
│    │       - nuova scadenza
│    │       - motivazione
│    │       - note
│    └─► ↩ resta in (F) IN ATTESA DI INTEGRAZIONE
│
├─► (T) Registra invio integrazione
│    ├─► (TL) Integrazione inviata
│    │       Dati:
│    │       - data invio
│    │       - modalità invio
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ (F) IN ATTESA DI DECRETO
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) IN ATTESA DI INTEGRAZIONE
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


======================================================================
RAMO DECRETO
======================================================================

(F) DECRETO RICEVUTO
│
├─► (T) Registra invio a SCP
│    ├─► (TL) Decreto inviato a SCP
│    │       Dati:
│    │       - data invio/deposito SCP
│    │       - modalità invio
│    │       - numero fattura
│    │       - data fattura
│    │       - importo fatturato
│    │       - note
│    │       - PEC, se necessaria
│    └─► (F) IN ATTESA DI LIQUIDAZIONE SCP
│
├─► (T) Richiedi correzione decreto
│    ├─► (TL) Correzione decreto richiesta
│    │       Dati:
│    │       - data richiesta
│    │       - motivo
│    │       - modalità deposito/invio
│    │       - note
│    │       - PEC, se necessaria
│    └─► (F) IN ATTESA DI ESITO CORREZIONE DECRETO
│
├─► (T) Registra impugnazione
│    ├─► (TL) Impugnazione decreto depositata
│    │       Dati:
│    │       - data deposito
│    │       - motivo
│    │       - autorità/ufficio
│    │       - modalità deposito
│    │       - note
│    │       - PEC, se necessaria
│    └─► (F) IN ATTESA DI ESITO IMPUGNAZIONE
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) DECRETO RICEVUTO
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


======================================================================
RAMO CORREZIONE DECRETO
======================================================================

(F) IN ATTESA DI ESITO CORREZIONE DECRETO
│
├─► (T) Registra sollecito correzione ⟳
│    ├─► (TL) Sollecito correzione effettuato
│    │       Dati:
│    │       - data
│    │       - modalità
│    │       - destinatario
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ resta in (F) IN ATTESA DI ESITO CORREZIONE DECRETO
│
├─► (T) Registra decreto corretto
│    ├─► (TL) Decreto corretto ricevuto
│    │       Dati:
│    │       - data ricezione
│    │       - data decreto
│    │       - numero decreto
│    │       - importo concesso aggiornato
│    │       - note
│    └─► ↩ (F) DECRETO RICEVUTO
│
├─► (T) Chiudi correzione senza nuovo decreto
│    ├─► (TL) Correzione chiusa senza nuovo decreto
│    │       Dati:
│    │       - data
│    │       - esito
│    │       - note
│    └─► ↩ (F) DECRETO RICEVUTO
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) IN ATTESA DI ESITO CORREZIONE DECRETO
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


======================================================================
RAMO IMPUGNAZIONE
======================================================================

(F) IN ATTESA DI ESITO IMPUGNAZIONE
│
├─► (T) Registra sollecito impugnazione ⟳
│    ├─► (TL) Sollecito impugnazione effettuato
│    │       Dati:
│    │       - data
│    │       - modalità
│    │       - destinatario
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ resta in (F) IN ATTESA DI ESITO IMPUGNAZIONE
│
├─► (T) Registra nuovo decreto
│    ├─► (TL) Nuovo decreto ricevuto
│    │       Dati:
│    │       - data ricezione
│    │       - data decreto
│    │       - numero decreto
│    │       - importo concesso aggiornato
│    │       - note
│    └─► ↩ (F) DECRETO RICEVUTO
│
├─► (T) Registra rigetto impugnazione
│    ├─► (TL) Impugnazione rigettata
│    │       Dati:
│    │       - data
│    │       - motivazione
│    │       - note
│    └─► ↩ (F) DECRETO RICEVUTO
│
├─► (T) Ritira impugnazione
│    ├─► (TL) Impugnazione ritirata
│    │       Dati:
│    │       - data
│    │       - motivo
│    │       - note
│    └─► ↩ (F) DECRETO RICEVUTO
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) IN ATTESA DI ESITO IMPUGNAZIONE
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


======================================================================
RAMO SCP / LIQUIDAZIONE
======================================================================

(F) IN ATTESA DI LIQUIDAZIONE SCP
│
├─► (T) Registra sollecito SCP ⟳
│    ├─► (TL) Sollecito SCP effettuato
│    │       Dati:
│    │       - data
│    │       - modalità
│    │       - destinatario
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ resta in (F) IN ATTESA DI LIQUIDAZIONE SCP
│
├─► (T) Registra richiesta di integrazione SCP
│    ├─► (TL) Integrazione SCP richiesta
│    │       Dati:
│    │       - data richiesta
│    │       - motivo
│    │       - termine
│    │       - note
│    └─► (F) IN ATTESA DI INTEGRAZIONE SCP
│
├─► (T) Registra liquidazione
│    ├─► (TL) Liquidazione ricevuta
│    │       Dati:
│    │       - data liquidazione
│    │       - importo liquidato
│    │       - note
│    └─► (F) LIQUIDATA
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) IN ATTESA DI LIQUIDAZIONE SCP
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


(F) IN ATTESA DI INTEGRAZIONE SCP
│
├─► (T) Registra sollecito integrazione SCP ⟳
│    ├─► (TL) Sollecito integrazione SCP effettuato
│    │       Dati:
│    │       - data
│    │       - modalità
│    │       - destinatario
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ resta in (F) IN ATTESA DI INTEGRAZIONE SCP
│
├─► (T) Registra invio integrazione SCP
│    ├─► (TL) Integrazione SCP inviata
│    │       Dati:
│    │       - data invio
│    │       - modalità invio
│    │       - note
│    │       - PEC, se necessaria
│    └─► ↩ (F) IN ATTESA DI LIQUIDAZIONE SCP
│
├─► (T) Sospendi pratica
│    ├─► (TL) Pratica sospesa
│    └─► (F) SOSPESA ⏸
│         │
│         ├─► (T) Riprendi pratica
│         │    ├─► (TL) Pratica riattivata
│         │    └─► ↩ (F) IN ATTESA DI INTEGRAZIONE SCP
│         │
│         └─► (T) Annulla pratica
│              ├─► (TL) Pratica annullata
│              └─► (F) ANNULLATA ✕
│
└─► (T) Annulla pratica
     ├─► (TL) Pratica annullata
     └─► (F) ANNULLATA ✕


======================================================================
CHIUSURA
======================================================================

(F) LIQUIDATA
│
└─► (T) Chiudi pratica
     ├─► (TL) Pratica chiusa
     │       Dati:
     │       - data chiusura
     │       - note finali
     └─► (F) CHIUSA ✓


(F) CHIUSA ✓
└─► Nessuna transizione ordinaria.
    La pratica resta consultabile con tutta la timeline.


(F) RIFIUTATA ✕
└─► Nessuna transizione ordinaria.
    La pratica resta consultabile con tutta la timeline.


(F) ANNULLATA ✕
└─► Nessuna transizione ordinaria.
    La pratica resta consultabile con tutta la timeline.


======================================================================
REGOLA COMPLETA DELLA SOSPENSIONE
======================================================================

QUALSIASI FASE APERTA
│
└─► (T) Sospendi pratica
     ├─► (TL) Pratica sospesa
     └─► (F) SOSPESA ⏸
          │
          ├─► (T) Riprendi pratica
          │    ├─► (TL) Pratica riattivata
          │    └─► ↩ ritorna alla fase da cui era stata sospesa
          │
          └─► (T) Annulla pratica
               ├─► (TL) Pratica annullata
               └─► (F) ANNULLATA ✕

ESEMPI DI RIPRESA

(F) IN ATTESA DI DECRETO
    └─► (T) Sospendi
         └─► (F) SOSPESA
              └─► (T) Riprendi
                   └─► ↩ (F) IN ATTESA DI DECRETO

(F) DECRETO RICEVUTO
    └─► (T) Sospendi
         └─► (F) SOSPESA
              └─► (T) Riprendi
                   └─► ↩ (F) DECRETO RICEVUTO

(F) IN ATTESA DI LIQUIDAZIONE SCP
    └─► (T) Sospendi
         └─► (F) SOSPESA
              └─► (T) Riprendi
                   └─► ↩ (F) IN ATTESA DI LIQUIDAZIONE SCP


======================================================================
PERCORSI COMPLETI DI ESEMPIO
======================================================================

PERCORSO STANDARD POSITIVO

(F) DEPOSITATA
    └─► (TL) Pratica depositata
         └─► automatico
              └─► (F) IN ATTESA DI DECRETO
                   └─► (T) Registra decreto
                        └─► (TL) Decreto ricevuto
                             └─► (F) DECRETO RICEVUTO
                                  └─► (T) Registra invio a SCP
                                       └─► (TL) Decreto inviato a SCP
                                            └─► (F) IN ATTESA DI LIQUIDAZIONE SCP
                                                 └─► (T) Registra liquidazione
                                                      └─► (TL) Liquidazione ricevuta
                                                           └─► (F) LIQUIDATA
                                                                └─► (T) Chiudi pratica
                                                                     └─► (TL) Pratica chiusa
                                                                          └─► (F) CHIUSA


PERCORSO CON SOLLECITI RIPETUTI

(F) IN ATTESA DI DECRETO
    ├─► (T) Registra sollecito
    │    └─► (TL) Primo sollecito effettuato
    │         └─► ↩ (F) IN ATTESA DI DECRETO
    │
    ├─► (T) Registra sollecito
    │    └─► (TL) Secondo sollecito effettuato
    │         └─► ↩ (F) IN ATTESA DI DECRETO
    │
    └─► (T) Registra decreto
         └─► (TL) Decreto ricevuto
              └─► (F) DECRETO RICEVUTO


PERCORSO CON INTEGRAZIONE

(F) IN ATTESA DI DECRETO
    └─► (T) Registra richiesta di integrazione
         └─► (TL) Integrazione richiesta
              └─► (F) IN ATTESA DI INTEGRAZIONE
                   ├─► (T) Registra sollecito integrazione
                   │    └─► (TL) Sollecito integrazione effettuato
                   │         └─► ↩ stessa fase
                   │
                   └─► (T) Registra invio integrazione
                        └─► (TL) Integrazione inviata
                             └─► ↩ (F) IN ATTESA DI DECRETO


PERCORSO CON CORREZIONE DECRETO

(F) DECRETO RICEVUTO
    └─► (T) Richiedi correzione decreto
         └─► (TL) Correzione decreto richiesta
              └─► (F) IN ATTESA DI ESITO CORREZIONE DECRETO
                   ├─► (T) Registra sollecito correzione
                   │    └─► (TL) Sollecito correzione effettuato
                   │         └─► ↩ stessa fase
                   │
                   └─► (T) Registra decreto corretto
                        └─► (TL) Decreto corretto ricevuto
                             └─► ↩ (F) DECRETO RICEVUTO


PERCORSO CON IMPUGNAZIONE

(F) DECRETO RICEVUTO
    └─► (T) Registra impugnazione
         └─► (TL) Impugnazione decreto depositata
              └─► (F) IN ATTESA DI ESITO IMPUGNAZIONE
                   ├─► (T) Registra sollecito impugnazione
                   │    └─► (TL) Sollecito impugnazione effettuato
                   │         └─► ↩ stessa fase
                   │
                   └─► (T) Registra nuovo decreto
                        └─► (TL) Nuovo decreto ricevuto
                             └─► ↩ (F) DECRETO RICEVUTO


PERCORSO CON SOSPENSIONE E RIPRESA

(F) IN ATTESA DI DECRETO
    └─► (T) Sospendi pratica
         └─► (TL) Pratica sospesa
              └─► (F) SOSPESA
                   └─► (T) Riprendi pratica
                        └─► (TL) Pratica riattivata
                             └─► ↩ (F) IN ATTESA DI DECRETO


PERCORSO CON INTEGRAZIONE SCP

(F) IN ATTESA DI LIQUIDAZIONE SCP
    └─► (T) Registra richiesta di integrazione SCP
         └─► (TL) Integrazione SCP richiesta
              └─► (F) IN ATTESA DI INTEGRAZIONE SCP
                   └─► (T) Registra invio integrazione SCP
                        └─► (TL) Integrazione SCP inviata
                             └─► ↩ (F) IN ATTESA DI LIQUIDAZIONE SCP


PERCORSO NEGATIVO — RIFIUTO

(F) IN ATTESA DI DECRETO
    └─► (T) Segna come rifiutata
         └─► (TL) Pratica rifiutata
              └─► (F) RIFIUTATA


PERCORSO NEGATIVO — ANNULLAMENTO

QUALSIASI FASE APERTA
    └─► (T) Annulla pratica
         └─► (TL) Pratica annullata
              └─► (F) ANNULLATA


======================================================================
RIASSUNTO TECNICO
======================================================================

Practice.currentPhaseId
= contiene la (F) fase corrente.

WorkflowTransition
= definisce la (T) azione disponibile,
  la fase di partenza e la fase di destinazione.

PracticeHistory
= conserva ogni (TL) evento.

previousPhaseId oppure dato equivalente
= conserva la fase di provenienza quando la pratica viene sospesa,
  così la transizione “Riprendi pratica” può riportarla nel punto corretto.

ESEMPIO CHIAVE

(F) IN ATTESA DI DECRETO
    └─► (T) Registra sollecito
         └─► (TL) Sollecito effettuato
              └─► ↩ la pratica resta in (F) IN ATTESA DI DECRETO

Quindi:
- “In attesa di decreto” è la fase;
- “Registra sollecito” è il pulsante/transizione;
- “Sollecito effettuato” è l’evento della timeline.
