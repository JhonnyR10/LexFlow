import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { appApi } from '../../api/app'
import type { AppInfoResponse } from '../../../shared/ipc'

export function useAppInfo(): UseQueryResult<AppInfoResponse, Error> {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: () => appApi.getInfo(),
    staleTime: Infinity,
  })
}
