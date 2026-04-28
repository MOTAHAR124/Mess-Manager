import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messService } from '@/services/messService';
import { memberService } from '@/services/memberService';
import { useMessStore } from '@/stores/messStore';
import type { CreateMessRequest } from '@/types/common';

export const useMessQuery = () => {
  const queryClient = useQueryClient();
  const { messId, setMess, setMembers } = useMessStore();

  const createMessMutation = useMutation({
    mutationFn: async (data: CreateMessRequest) => {
      const response = await messService.createMess(data);
      if (!response.data) throw new Error(response.message || 'Failed to create mess');
      return response.data;
    },
    onSuccess: (mess) => {
      setMess(mess.id, mess.name);
      setMembers(mess.members || []);
      queryClient.invalidateQueries({ queryKey: ['mess'] });
    },
  });

  const getMessQuery = useQuery({
    queryKey: ['mess', messId],
    queryFn: async () => {
      if (!messId) return null;
      const response = await messService.getMessById(messId);
      return response.data || null;
    },
    enabled: !!messId,
    staleTime: 1000 * 60 * 5,
  });

  const getMembersQuery = useQuery({
    queryKey: ['members', messId],
    queryFn: async () => {
      if (!messId) return [];
      const response = await messService.getMembers(messId);
      return response.data || [];
    },
    enabled: !!messId,
    staleTime: 1000 * 60 * 2,
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; firstName?: string; lastName?: string; messId?: string | null }) => {
      const currentMessId = data.messId || messId;
      if (!currentMessId) throw new Error('No active mess selected');
      return memberService.addMember({
        messId: currentMessId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => memberService.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  return {
    createMessMutation,
    getMessQuery,
    getMembersQuery,
    addMemberMutation,
    removeMemberMutation,
  };
};
