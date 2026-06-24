import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query'
import { practicesApi } from '../../api/practices'
import type {
  CreatePracticeInput,
  CreatePracticeResponse,
  GetPracticeResponse,
  PracticesListResponse,
} from '../../../shared/ipc'

export function useActivePractices(): UseQueryResult<PracticesListResponse, Error> {
  return useQuery({
    queryKey: ['practices'],
    queryFn: () => practicesApi.listPractices(),
  })
}

export function usePracticeDetail(id: number | null): UseQueryResult<GetPracticeResponse, Error> {
  return useQuery({
    queryKey: ['practice', id],
    queryFn: () => practicesApi.getPractice({ id: id as number }),
    enabled: id != null,
  })
}

export function useCreatePractice(): UseMutationResult<CreatePracticeResponse, Error, CreatePracticeInput, unknown> {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePracticeInput) => practicesApi.createPractice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
    },
  })
}
