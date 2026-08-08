import { createContext, useContext, useState, ReactNode } from "react";

interface InviteState {
  isOpen: boolean;
  partnerId: number | null;
  preSelectedRestaurantId: number | null;
  step: 1 | 2 | 3 | 'sent';
  selectedRestaurantId: number | null;
  selectedMode: string | null;
  selectedTime: string | null;
  commitment: string | null;
}

interface InviteContextType {
  state: InviteState;
  openInvite: (partnerId: number, preSelectedRestaurantId?: number | null, commitment?: string | null) => void;
  closeInvite: () => void;
  setStep: (step: 1 | 2 | 3 | 'sent') => void;
  setRestaurant: (id: number) => void;
  setMode: (mode: string) => void;
  setTime: (time: string) => void;
  setCommitment: (c: string) => void;
  reset: () => void;
}

const defaultState: InviteState = {
  isOpen: false,
  partnerId: null,
  preSelectedRestaurantId: null,
  step: 1,
  selectedRestaurantId: null,
  selectedMode: null,
  selectedTime: null,
  commitment: null,
};

const InviteContext = createContext<InviteContextType | undefined>(undefined);

export function InviteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InviteState>(defaultState);

  const openInvite = (
    partnerId: number,
    preSelectedRestaurantId: number | null = null,
    commitment: string | null = null
  ) => {
    setState({
      ...defaultState,
      isOpen: true,
      partnerId,
      preSelectedRestaurantId,
      selectedRestaurantId: preSelectedRestaurantId,
      commitment,
      selectedMode: commitment ?? null,
    });
  };

  const closeInvite = () => setState(prev => ({ ...prev, isOpen: false }));
  const setStep = (step: 1 | 2 | 3 | 'sent') => setState(prev => ({ ...prev, step }));
  const setRestaurant = (id: number) => setState(prev => ({ ...prev, selectedRestaurantId: id }));
  const setMode = (mode: string) => setState(prev => ({ ...prev, selectedMode: mode }));
  const setTime = (time: string) => setState(prev => ({ ...prev, selectedTime: time }));
  const setCommitment = (c: string) => setState(prev => ({ ...prev, commitment: c, selectedMode: c }));
  const reset = () => setState(defaultState);

  return (
    <InviteContext.Provider value={{ state, openInvite, closeInvite, setStep, setRestaurant, setMode, setTime, setCommitment, reset }}>
      {children}
    </InviteContext.Provider>
  );
}

export function useInvite() {
  const context = useContext(InviteContext);
  if (!context) throw new Error("useInvite must be used within InviteProvider");
  return context;
}
