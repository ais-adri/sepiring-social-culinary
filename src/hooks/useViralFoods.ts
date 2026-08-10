import { useQuery } from "@tanstack/react-query";
import { viralFoods as fallbackViralFoods } from "@/data/sampleData";

export type ViralFood = {
  id: number | string;
  name: string;
  origin: string;
  area: string;
  heat: number;
  tag: string;
  image?: string;
  videoUrl?: string;
};

type ViralFoodsResponse = {
  source: "youtube" | "fallback";
  items: ViralFood[];
};

async function fetchViralFoods(): Promise<ViralFood[]> {
  const res = await fetch("/api/viral-foods");
  if (!res.ok) throw new Error(`Gagal memuat makanan viral: ${res.status}`);
  const data: ViralFoodsResponse = await res.json();
  return data.items.length > 0 ? data.items : fallbackViralFoods;
}

export function useViralFoods() {
  return useQuery({
    queryKey: ["viral-foods"],
    queryFn: fetchViralFoods,
    initialData: fallbackViralFoods,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
