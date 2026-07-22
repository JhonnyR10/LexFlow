import type {
  CreateScadenzaInput,
  DeleteScadenzaInput,
  DeleteScadenzaResponse,
  ListScadenzeInput,
  ListScadenzeResponse,
  ScadenzaItem,
  UpdateScadenzaInput,
} from '../../shared/ipc'

export const scadenzeApi = {
  listByPractice: (input: ListScadenzeInput): Promise<ListScadenzeResponse> =>
    window.api.scadenze.listByPractice(input),
  create: (input: CreateScadenzaInput): Promise<ScadenzaItem> =>
    window.api.scadenze.create(input),
  update: (input: UpdateScadenzaInput): Promise<ScadenzaItem> =>
    window.api.scadenze.update(input),
  delete: (input: DeleteScadenzaInput): Promise<DeleteScadenzaResponse> =>
    window.api.scadenze.delete(input),
}
