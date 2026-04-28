import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MembersService, type Member, type CreateMemberDto } from '../services/membersService';
import { useMessStore } from '@/stores/messStore';
import { useUiStore } from '@/stores/uiStore';

/**
 * useMembers Hook
 * Manages member data fetching, mutations, and state
 */

export const useMembers = (messId?: string, pageSize: number = 20) => {
  const queryClient = useQueryClient();
  const { setPageLoading, addToast } = useUiStore();
  const activeMess = useMessStore((s) => s.messId);
  const currentMessId = messId || activeMess;

  // Fetch members list
  const membersQuery = useQuery({
    queryKey: ['members', currentMessId],
    queryFn: () => MembersService.getMembers(currentMessId!, undefined, pageSize),
    enabled: !!currentMessId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (dto: CreateMemberDto) =>
      MembersService.addMember(currentMessId!, dto),
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['members', currentMessId] });
      addToast({
        message: `${newMember.name} added successfully`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        message: error.response?.data?.error?.message || 'Failed to add member',
        type: 'error',
      });
    },
  });

  // Update member mutation
  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, ...data }: { memberId: string; [key: string]: any }) =>
      MembersService.updateMember(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentMessId] });
      addToast({
        message: 'Member updated successfully',
        type: 'success',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => MembersService.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentMessId] });
      addToast({
        message: 'Member removed successfully',
        type: 'success',
      });
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: 'MANAGER' | 'MEMBER';
    }) => MembersService.changeMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', currentMessId] });
      addToast({
        message: 'Role updated successfully',
        type: 'success',
      });
    },
  });

  // Get member summary
  const memberSummaryQuery = useQuery({
    queryKey: ['memberSummary', currentMessId],
    queryFn: () => MembersService.getMemberSummary(currentMessId!),
    enabled: !!currentMessId,
  });

  return {
    // Queries
    members: membersQuery.data?.data || [],
    isLoadingMembers: membersQuery.isLoading,
    isErrorMembers: membersQuery.isError,
    membersError: membersQuery.error,
    membersPagination: {
      cursor: membersQuery.data?.pagination?.cursor || null,
      hasMore: membersQuery.data?.pagination?.hasMore || false,
    },

    // Summary
    memberSummary: memberSummaryQuery.data,
    isLoadingSummary: memberSummaryQuery.isLoading,

    // Mutations
    addMember: addMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    updateMember: updateMemberMutation.mutate,
    isUpdatingMember: updateMemberMutation.isPending,
    removeMember: removeMemberMutation.mutate,
    isRemovingMember: removeMemberMutation.isPending,
    changeRole: changeRoleMutation.mutate,
    isChangingRole: changeRoleMutation.isPending,

    // Refetch
    refetchMembers: membersQuery.refetch,
  };
};
