import { useQueryClient, useMutation } from '@tanstack/react-query'

interface CreateOptimisticMutationOptions<TData, TError, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKeyToUpdate: any[] | ((variables: TVariables) => any[])
  updateFn: (oldData: any, variables: TVariables) => any
  onSuccessCallback?: (data: TData, variables: TVariables) => void
  onErrorCallback?: (error: TError, variables: TVariables) => void
  onSettledCallback?: (variables: TVariables) => void
}

export function useOptimisticMutation<TData = any, TError = any, TVariables = any>({
  mutationFn,
  queryKeyToUpdate,
  updateFn,
  onSuccessCallback,
  onErrorCallback,
  onSettledCallback,
}: CreateOptimisticMutationOptions<TData, TError, TVariables>) {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, { previousData: any; targetKey: any[] }>({
    mutationFn,
    onMutate: async (variables) => {
      const targetKey = typeof queryKeyToUpdate === 'function'
        ? queryKeyToUpdate(variables)
        : queryKeyToUpdate

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: targetKey })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(targetKey)

      // Optimistically update
      queryClient.setQueryData(targetKey, (old: any) => updateFn(old, variables))

      return { previousData, targetKey }
    },
    onError: (err, variables, context) => {
      if (context?.targetKey && context.previousData !== undefined) {
        queryClient.setQueryData(context.targetKey, context.previousData)
      }
      if (onErrorCallback) {
        onErrorCallback(err, variables)
      }
    },
    onSuccess: (data, variables) => {
      if (onSuccessCallback) {
        onSuccessCallback(data, variables)
      }
    },
    onSettled: (_data, _error, variables, context) => {
      if (context?.targetKey) {
        queryClient.invalidateQueries({ queryKey: context.targetKey })
      }
      if (onSettledCallback) {
        onSettledCallback(variables)
      }
    },
  })
}
