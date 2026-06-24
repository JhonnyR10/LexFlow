import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { practicesApi } from '../../api/practices'
import type { CreatePracticeInput } from '../../../shared/ipc'

export function useActivePractices() {
  return useQuery({
    queryKey: ['practices'],
    queryFn: () => practicesApi.listPractices(),
  })
}

export function useCreatePractice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePracticeInput) => practicesApi.createPractice(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practices'] })
    },
  })
}
