import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface UserData {
  user: {
    id: string;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
    aud: string;
    created_at: string;
    email?: string;
    phone?: string;
  } | null;
}


export const useGetUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<UserData> => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      return {
        user: data.user,
      };
    },

    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
