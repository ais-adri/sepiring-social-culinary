import { createContext, useContext, useState, ReactNode } from "react";

interface RestaurantContextType {
  openRestaurantId: number | null;
  openRestaurant: (id: number) => void;
  closeRestaurant: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [openRestaurantId, setOpenRestaurantId] = useState<number | null>(null);

  const openRestaurant = (id: number) => setOpenRestaurantId(id);
  const closeRestaurant = () => setOpenRestaurantId(null);

  return (
    <RestaurantContext.Provider value={{ openRestaurantId, openRestaurant, closeRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error("useRestaurant must be used within RestaurantProvider");
  return context;
}
