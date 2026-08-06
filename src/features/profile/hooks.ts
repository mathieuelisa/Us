import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import { fetchMyProfile, updateMyProfile } from './api';

export function useMyProfile() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;

  return useQuery({
    queryKey: queryKeys.profile.mine,
    queryFn: () => fetchMyProfile(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpdateMyProfile() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firstName: string) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyProfile(userId, { first_name: firstName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}
