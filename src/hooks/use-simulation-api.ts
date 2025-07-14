import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/*
Reusable React-Query hooks wrapping all backend endpoints. Using these ensures
– automatic caching
– request deduping
– simple invalidation after mutations so UI refreshes automatically
*/

// -------------------- GET QUERIES -----------------------------------------
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 60_000, // poll every minute – cheap endpoint
  });
}

export function useStatus() {
  return useQuery({
    queryKey: ["status"],
    queryFn: api.status,
    refetchInterval: 2_000, // keep UI snappy (2s)
  });
}

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: api.history,
    refetchOnWindowFocus: false,
  });
}

// -------------------- POST MUTATIONS --------------------------------------
export function useReset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.reset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["status"] });
      qc.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useSendPacket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.sendPacket,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["status"] }),
  });
}

export function useHandshake() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.handshake,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["status"] }),
  });
}

export function useRunTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.runTest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["status", "history"] }),
  });
}

export function useValidateChecksum() {
  return useMutation({
    mutationFn: api.validateChecksum,
  });
}

export function useGeneratePacket() {
  return useMutation({
    mutationFn: api.generatePacket,
  });
}
