import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { scadenzeApi } from '../../api/scadenze'
import type {
  CreateScadenzaInput,
  DeleteScadenzaInput,
  DeleteScadenzaResponse,
  ListScadenzeResponse,
  ScadenzaItem,
  UpdateScadenzaInput,
} from '../../../shared/ipc'

export function useScadenze(practiceId: number | null): UseQueryResult<ListScadenzeResponse, Error> {
  return useQuery({
    queryKey: ['scadenze', practiceId],
    queryFn: () => scadenzeApi.listByPractice({ practiceId: practiceId as number }),
    enabled: practiceId != null,
  })
}

// Ogni mutazione invalida l'elenco scadenze e il dettaglio pratica (nuovo
// HistoryEvent nella timeline).
function useScadenzaMutationInvalidation(practiceId: number): () => void {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['scadenze', practiceId] })
    queryClient.invalidateQueries({ queryKey: ['practice', practiceId] })
    // Gli alert scadenze in Dashboard (S15.2) dipendono da queste modifiche.
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useCreateScadenza(
  practiceId: number
): UseMutationResult<ScadenzaItem, Error, CreateScadenzaInput, unknown> {
  const invalidate = useScadenzaMutationInvalidation(practiceId)
  return useMutation({
    mutationFn: (input: CreateScadenzaInput) => scadenzeApi.create(input),
    onSuccess: invalidate,
  })
}

export function useUpdateScadenza(
  practiceId: number
): UseMutationResult<ScadenzaItem, Error, UpdateScadenzaInput, unknown> {
  const invalidate = useScadenzaMutationInvalidation(practiceId)
  return useMutation({
    mutationFn: (input: UpdateScadenzaInput) => scadenzeApi.update(input),
    onSuccess: invalidate,
  })
}

export function useDeleteScadenza(
  practiceId: number
): UseMutationResult<DeleteScadenzaResponse, Error, DeleteScadenzaInput, unknown> {
  const invalidate = useScadenzaMutationInvalidation(practiceId)
  return useMutation({
    mutationFn: (input: DeleteScadenzaInput) => scadenzeApi.delete(input),
    onSuccess: invalidate,
  })
}
