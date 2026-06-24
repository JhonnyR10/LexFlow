# 05 — Glossario di dominio

Termini del dominio legale/amministrativo che LexFlow gestisce. Servono a interpretare correttamente requisiti e dati.

- **Istanza / Pratica** — la singola richiesta di liquidazione o notula spese depositata. Unità centrale dell'app, entità unica.
- **Notula spese** — nota delle spese/competenze presentata per la liquidazione.
- **Collaboratore di giustizia** — soggetto a cui si riferiscono una o più pratiche (interrogatori, processi, altre attività). Collegato per ID.
- **Professionista** — il professionista che presenta o cura la pratica. Collegato per ID.
- **Tipologia attività** — natura dell'attività (es. Interrogatorio, Processo, Testimonianza assistita). Valori configurabili.
- **Autorità giudiziaria** — l'ufficio/organo giudiziario di riferimento. Configurabile.
- **Competenza / ufficio** — livello/ufficio competente (es. GIP/GUP, Tribunale, Corte d'Assise, Corte d'Appello, Cassazione). Configurabile.
- **Numero di procedimento** — riferimenti del fascicolo (es. R.G.N.R., R.G. GIP, R.G. Tribunale, R.G. Appello). Possono essere più d'uno per pratica.
- **Deposito** — atto di presentazione dell'istanza. Ha data e modalità (PEC / a mano). Se PEC, uno o più destinatari.
- **PEC** — posta elettronica certificata. Le PEC del deposito e quelle dell'invio SCP sono distinte.
- **Decreto di liquidazione** — provvedimento con cui viene liquidato l'importo. Porta data ricezione, data decreto, numero, importo concesso.
- **SCP** — ufficio a cui il decreto/fattura viene inviato dopo la ricezione (passaggio obbligatorio post-decreto). Modalità invio: PEC / raccomandata.
- **Fattura** — documento emesso per l'invio SCP. Porta numero, data, importo.
- **Sollecito** — sollecito di una pratica ferma in attesa di decreto. Fase **ripetibile**: più solleciti per pratica, non genera nuove pratiche.
- **Integrazione** — richiesta di integrazione documentale/informativa. Può essercene più d'una; richiesta e successivo invio.
- **Liquidazione** — pagamento finale. Porta data liquidazione e importo liquidato.

## Importi (4, inseriti a mano)

- **Importo richiesto** — quanto richiesto nell'istanza (dato generale).
- **Importo concesso** — riconosciuto nel decreto.
- **Importo fatturato** — della fattura inviata a SCP.
- **Importo liquidato** — effettivamente pagato.

Nessun calcolo fiscale automatico. Calcolate solo le differenze (vedi data-model).

## Stati/fasi standard (categorie logiche)

13 fasi canoniche (vedi `docs/03-workflow-engine.md` e `docs/07-workflow-tree.md`): Depositata, In attesa di decreto, In attesa di integrazione, Decreto ricevuto, In attesa di esito correzione decreto, In attesa di esito impugnazione, In attesa di liquidazione SCP, In attesa di integrazione SCP, Liquidata, Chiusa, Rifiutata, Sospesa, Annullata.

**Eventi, NON fasi:** sollecito (ripetibile, resta nella fase), richiesta/invio integrazione, invio a SCP, correzione/impugnazione registrate. Sono transizioni che producono eventi di timeline; alcune restano nella stessa fase, altre spostano in una fase di attesa.

Finali: **Chiusa** (positiva), **Rifiutata** e **Annullata** (negative). `Liquidata` non è finale (porta a Chiusa). `Sospesa` è reversibile e ricorda la fase di provenienza.

Iter tipico positivo: Depositata → (auto) In attesa di decreto → Decreto ricevuto → (eventuale correzione/impugnazione) → In attesa di liquidazione SCP → Liquidata → Chiusa.

## Vincolo di coerenza chiave

Non si arriva a "Liquidata" senza che risultino registrati decreto e invio SCP.
