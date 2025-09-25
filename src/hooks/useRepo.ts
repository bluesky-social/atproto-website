import { useQuery } from '@tanstack/react-query'
import {
  Agent,
  ComAtprotoRepoDescribeRepo,
  ComAtprotoRepoListRecords,
  ComAtprotoRepoGetRecord,
} from '@atproto/api'

export function useDescribeRepo(repo?: string) {
  return useQuery({
    queryKey: ['describeRepo', repo],
    queryFn: async () => {
      if (!repo) {
        throw new Error('Repo is required')
      }

      const agent = new Agent({
        service: 'https://bsky.social',
      })
      const response = await agent.com.atproto.repo.describeRepo({ repo })

      if (!response.success) {
        throw new Error('Failed to describe repo')
      }

      return response.data as ComAtprotoRepoDescribeRepo.OutputSchema
    },
    enabled: !!repo,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useListRecords(params?: {
  repo?: string
  collection?: string
  limit?: number
  cursor?: string
  reverse?: boolean
}) {
  return useQuery({
    queryKey: ['listRecords', params],
    queryFn: async () => {
      if (!params?.repo) {
        throw new Error('Repo is required')
      }

      if (!params?.collection) {
        throw new Error('Collection is required')
      }

      const agent = new Agent({
        service: 'https://bsky.social',
      })
      const response = await agent.com.atproto.repo.listRecords({
        repo: params.repo,
        collection: params.collection,
        limit: params.limit,
        cursor: params.cursor,
        reverse: params.reverse,
      })

      if (!response.success) {
        throw new Error('Failed to list records')
      }

      return response.data as ComAtprotoRepoListRecords.OutputSchema
    },
    enabled: !!params?.repo && !!params?.collection,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useGetRecord(params?: {
  repo?: string
  collection?: string
  rkey?: string
  cid?: string
}) {
  return useQuery({
    queryKey: ['getRecord', params],
    queryFn: async () => {
      if (!params?.repo) {
        throw new Error('Repo is required')
      }

      if (!params?.collection) {
        throw new Error('Collection is required')
      }

      if (!params?.rkey) {
        throw new Error('Record key is required')
      }

      const agent = new Agent({
        service: 'https://bsky.social',
      })
      const response = await agent.com.atproto.repo.getRecord({
        repo: params.repo,
        collection: params.collection,
        rkey: params.rkey,
        cid: params.cid,
      })

      if (!response.success) {
        throw new Error('Failed to get record')
      }

      return response.data as ComAtprotoRepoGetRecord.OutputSchema
    },
    enabled: !!params?.repo && !!params?.collection && !!params?.rkey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
