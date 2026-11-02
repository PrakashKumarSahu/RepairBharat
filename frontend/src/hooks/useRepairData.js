import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchTickets,
    fetchBranches,
    fetchStages,
    fetchTechnicians,
    fetchInventory,
    fetchInvoices,
    fetchCustomers,
    fetchJoinRequests,
} from '../services/api';

/**
 * Master data hook for ShopOwnerDashboard.
 * Uses React Query for caching, background refresh, and deduplication.
 */
export function useShopOwnerData() {
    const qc = useQueryClient();

    const ticketsQ     = useQuery({ queryKey: ['tickets'],       queryFn: fetchTickets,             refetchInterval: 15_000 });
    const branchesQ    = useQuery({ queryKey: ['branches'],      queryFn: () => fetchBranches({}),  staleTime: 120_000 });
    const stagesQ      = useQuery({ queryKey: ['stages'],        queryFn: fetchStages,              staleTime: 300_000 });
    const techniciansQ = useQuery({ queryKey: ['technicians'],   queryFn: fetchTechnicians,         refetchInterval: 30_000 });
    const inventoryQ   = useQuery({ queryKey: ['inventory'],     queryFn: fetchInventory,           refetchInterval: 60_000 });
    const invoicesQ    = useQuery({ queryKey: ['invoices'],      queryFn: fetchInvoices,            refetchInterval: 30_000 });
    const customersQ   = useQuery({ queryKey: ['customers'],     queryFn: fetchCustomers,           staleTime: 300_000 });
    const joinReqQ     = useQuery({ queryKey: ['join-requests'], queryFn: fetchJoinRequests,        refetchInterval: 30_000 });

    const refreshAll = () => qc.invalidateQueries();

    return {
        tickets:      ticketsQ.data      ?? [],
        branches:     branchesQ.data     ?? [],
        stages:       stagesQ.data       ?? [],
        technicians:  techniciansQ.data  ?? [],
        inventory:    inventoryQ.data    ?? [],
        invoices:     invoicesQ.data     ?? [],
        customers:    customersQ.data    ?? [],
        joinRequests: joinReqQ.data      ?? [],
        isLoading:    ticketsQ.isPending || branchesQ.isPending,
        refreshAll,
    };
}

/**
 * Data hook for TechnicianDashboard.
 */
export function useTechnicianData() {
    const qc = useQueryClient();

    const ticketsQ  = useQuery({ queryKey: ['tickets'],       queryFn: fetchTickets,      refetchInterval: 10_000 });
    const stagesQ   = useQuery({ queryKey: ['stages'],        queryFn: fetchStages,       staleTime: 300_000 });
    const invoicesQ = useQuery({ queryKey: ['invoices'],      queryFn: fetchInvoices,     refetchInterval: 30_000 });
    const joinReqQ  = useQuery({ queryKey: ['join-requests'], queryFn: fetchJoinRequests, refetchInterval: 30_000 });

    return {
        tickets:        ticketsQ.data  ?? [],
        stages:         stagesQ.data   ?? [],
        invoices:       invoicesQ.data ?? [],
        joinRequests:   joinReqQ.data  ?? [],
        isLoading:      ticketsQ.isPending,
        refetchTickets:  () => qc.invalidateQueries({ queryKey: ['tickets'] }),
        refetchInvoices: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
        refetchAll:      () => qc.invalidateQueries(),
    };
}
