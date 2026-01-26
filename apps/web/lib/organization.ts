"use client";

/**
 * Organization hooks and utilities for BudgetBee
 * Uses Better Auth's organization API methods directly
 */

import { authClient } from "@budgetbee/core/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Re-export Better Auth's built-in hooks for organizations
// These are reactive hooks that automatically update when data changes

/**
 * Hook to list all organizations the user is a member of
 * Uses Better Auth's built-in reactive hook
 */
export const useOrganizations = () => {
    return authClient.useListOrganizations();
};

/**
 * Hook to get the active organization
 * Uses Better Auth's built-in reactive hook
 */
export const useActiveOrganization = () => {
    return authClient.useActiveOrganization();
};

// Organization types from Better Auth
export type Organization = {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    createdAt: Date;
    metadata?: Record<string, unknown>;
};

export type Member = {
    id: string;
    organizationId: string;
    userId: string;
    role: "owner" | "admin" | "editor" | "viewer";
    createdAt: Date;
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
};

export type Invitation = {
    id: string;
    organizationId: string;
    email: string;
    role: "owner" | "admin" | "editor" | "viewer";
    status: "pending" | "accepted" | "rejected" | "canceled";
    expiresAt: Date;
    inviterId: string;
};

// Mutations for organization management

/**
 * Create a new organization
 */
export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; slug?: string; logo?: string }) => {
            if (!data.slug) throw { message: "Slug must be provided" }
            const res = await authClient.organization.create({
                name: data.name,
                slug: data.slug,
                logo: data.logo,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization created successfully");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create organization");
        },
    });
};

/**
 * Update an organization
 */
export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            organizationId?: string;
            name?: string;
            slug?: string;
            logo?: string;
        }) => {
            const res = await authClient.organization.update({
                data: {
                    name: data.name,
                    slug: data.slug,
                    logo: data.logo,
                },
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization updated successfully");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update organization");
        },
    });
};

/**
 * Delete an organization
 */
export const useDeleteOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (organizationId: string) => {
            const res = await authClient.organization.delete({
                organizationId,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Organization deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete organization");
        },
    });
};

/**
 * Set the active organization
 */
export const useSetActiveOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (organizationId: string | null) => {
            const res = await authClient.organization.setActive({
                organizationId,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to switch organization");
        },
    });
};

// Invitation mutations

/**
 * Invite a member to an organization
 */
export const useInviteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            organizationId?: string;
            email: string;
            role: "admin" | "editor" | "viewer";
        }) => {
            const res = await authClient.organization.inviteMember({
                organizationId: data.organizationId,
                email: data.email,
                role: data.role,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invitation sent successfully");
            queryClient.invalidateQueries({ queryKey: ["organizations", "invitations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to send invitation");
        },
    });
};

/**
 * Cancel an invitation
 */
export const useCancelInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId: string) => {
            const res = await authClient.organization.cancelInvitation({ invitationId });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invitation canceled");
            queryClient.invalidateQueries({ queryKey: ["organizations", "invitations"] });
            queryClient.refetchQueries({ queryKey: ["organizations", "invitations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel invitation");
        },
    });
};

/**
 * Accept an invitation
 */
export const useAcceptInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId: string) => {
            const res = await authClient.organization.acceptInvitation({
                invitationId,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invitation accepted! Welcome to the team.");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to accept invitation");
        },
    });
};

/**
 * Reject an invitation
 */
export const useRejectInvitation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invitationId: string) => {
            const res = await authClient.organization.rejectInvitation({
                invitationId,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Invitation declined");
            queryClient.invalidateQueries({ queryKey: ["organizations", "my-invitations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to decline invitation");
        },
    });
};

// Member mutations

/**
 * Update a member's role
 */
export const useUpdateMemberRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            organizationId?: string;
            memberId: string;
            role: "admin" | "editor" | "viewer";
        }) => {
            const res = await authClient.organization.updateMemberRole({
                organizationId: data.organizationId,
                memberId: data.memberId,
                role: data.role,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Member role updated");
            queryClient.invalidateQueries({ queryKey: ["organizations", "members"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update member role");
        },
    });
};

/**
 * Remove a member from an organization
 */
export const useRemoveMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { organizationId?: string; memberId: string }) => {
            const res = await authClient.organization.removeMember({
                organizationId: data.organizationId,
                memberIdOrEmail: data.memberId,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Member removed from organization");
            queryClient.invalidateQueries({ queryKey: ["organizations", "members"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove member");
        },
    });
};

/**
 * Leave an organization
 */
export const useLeaveOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (organizationId: string) => {
            const res = await authClient.organization.leave({
                organizationId,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Left organization successfully");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to leave organization");
        },
    });
};

/**
 * Check if user has permission
 */
export const useHasPermission = () => {
    return useMutation({
        mutationFn: async (permissions: Record<string, string[]>) => {
            const res = await authClient.organization.hasPermission({
                permissions,
            });
            if (res.error) throw new Error(res.error.message);
            return res.data;
        },
    });
};

// RBAC helpers (for client-side role checks)

/**
 * Check if a role has a specific permission level
 */
export const hasPermission = (
    userRole: "owner" | "admin" | "editor" | "viewer" | undefined,
    requiredRole: "owner" | "admin" | "editor" | "viewer"
): boolean => {
    if (!userRole) return false;
    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const canManageMembers = (role?: "owner" | "admin" | "editor" | "viewer") =>
    hasPermission(role, "admin");

export const canDeleteOrganization = (role?: "owner" | "admin" | "editor" | "viewer") =>
    hasPermission(role, "owner");

export const canUpdateOrganization = (role?: "owner" | "admin" | "editor" | "viewer") =>
    hasPermission(role, "admin");

export const canInviteMembers = (role?: "owner" | "admin" | "editor" | "viewer") =>
    hasPermission(role, "admin");

/**
 * Use Better Auth's built-in role check
 * This is synchronous and works for static role checks
 */
export const checkRolePermission = (params: {
    permissions: Record<string, string[]>;
    role: "owner" | "admin" | "editor" | "viewer";
}) => {
    return authClient.organization.checkRolePermission(params);
};
