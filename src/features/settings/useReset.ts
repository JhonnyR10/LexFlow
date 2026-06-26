import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { resetApi } from '../../api/reset'
import type { ResetArchiveResponse } from '../../../shared/ipc'

export function useResetArchive(): UseMutationResult<ResetArchiveResponse, Error, void, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => resetApi.archive(),
    onSuccess: () => {
      // Reset totale dell'archivio: invalida tutto (elenco, dashboard, cestino,
      // anagrafiche) per ricaricare le viste svuotate.
      void queryClient.invalidateQueries()
    },
  })
}
