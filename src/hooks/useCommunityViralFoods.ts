import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ViralFood } from "@/hooks/useViralFoods";

export type CommunitySubmission = {
  name: string;
  origin: string;
  area: string;
  tag: string;
  heat: number;
  submittedBy?: string;
};

async function fetchCommunityViralFoods(): Promise<ViralFood[]> {
  const res = await fetch("/api/community-viral-foods");
  if (!res.ok) throw new Error(`Gagal memuat makanan viral komunitas: ${res.status}`);
  const data: { items: ViralFood[] } = await res.json();
  return data.items;
}

export function useCommunityViralFoods() {
  return useQuery({
    queryKey: ["community-viral-foods"],
    queryFn: fetchCommunityViralFoods,
    staleTime: 0,
    retry: 1,
  });
}

export function useSubmitViralFood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submission: CommunitySubmission) => {
      const res = await fetch("/api/community-viral-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Gagal mengirim: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-viral-foods"] });
    },
  });
}
