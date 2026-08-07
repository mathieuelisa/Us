import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import type { Household } from '@/features/household/api';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import { fetchHubSummary } from './api';

export function useHubSummary(household: Household | null | undefined) {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;

  return useQuery({
    queryKey: queryKeys.hub.summary(household?.id ?? ''),
    queryFn: () => fetchHubSummary(household as Household, userId as string),
    enabled: Boolean(household?.id && userId),
  });
}
