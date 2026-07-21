import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { documentsApi } from '../../api/documents'
import type {
  ListDocumentsResponse,
  UploadDocumentInput,
  UploadDocumentResponse,
  DeleteDocumentInput,
  DeleteDocumentResponse,
} from '../../../shared/ipc'

export function useDocuments(practiceId: number | null): UseQueryResult<ListDocumentsResponse, Error> {
  return useQuery({
    queryKey: ['documents', practiceId],
    queryFn: () => documentsApi.listByPractice({ practiceId: practiceId as number }),
    enabled: practiceId != null,
  })
}

export function useUploadDocument(
  practiceId: number
): UseMutationResult<UploadDocumentResponse, Error, UploadDocumentInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UploadDocumentInput) => documentsApi.upload(input),
    onSuccess: () => {
      // Lista documenti + dettaglio (nuovo evento storico) vanno ricaricati.
      queryClient.invalidateQueries({ queryKey: ['documents', practiceId] })
      queryClient.invalidateQueries({ queryKey: ['practice', practiceId] })
      // Card «documenti mancanti» (S8.5): aggiungere/rimuovere un documento può
      // far comparire o sparire la pratica dalla sezione Dashboard.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteDocument(
  practiceId: number
): UseMutationResult<DeleteDocumentResponse, Error, DeleteDocumentInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: DeleteDocumentInput) => documentsApi.delete(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', practiceId] })
      queryClient.invalidateQueries({ queryKey: ['practice', practiceId] })
      // Card «documenti mancanti» (S8.5): aggiungere/rimuovere un documento può
      // far comparire o sparire la pratica dalla sezione Dashboard.
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
