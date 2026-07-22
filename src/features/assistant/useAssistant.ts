import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { assistantApi } from '../../api/assistant'
import type { AssistantAskResponse } from '../../../shared/ipc'

// L'assistente è read-only: ogni domanda è una richiesta indipendente. useMutation
// (non useQuery) perché la query è un input imperativo dell'utente, non uno stato
// di cache da mantenere; la cronologia vive nello stato locale della pagina.
export function useAskAssistant(): UseMutationResult<AssistantAskResponse, Error, string> {
  return useMutation({
    mutationFn: (query: string) => assistantApi.ask({ query }),
  })
}
