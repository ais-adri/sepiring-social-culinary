import { Switch as WouterSwitch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { InviteProvider } from "@/context/InviteContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { AppShell } from "@/components/layout/AppShell";
import { InviteDrawer } from "@/components/InviteDrawer";
import { RestaurantSheet } from "@/components/RestaurantSheet";

import Home from "@/pages/Home";
import Wishlist from "@/pages/Wishlist";
import PetaRasa from "@/pages/PetaRasa";
import Profil from "@/pages/Profil";
import Search from "@/pages/Search";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppShell>
      <WouterSwitch>
        <Route path="/" component={Home} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/peta-rasa" component={PetaRasa} />
        <Route path="/profil" component={Profil} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </WouterSwitch>
      <InviteDrawer />
      <RestaurantSheet />
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InviteProvider>
          <RestaurantProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </RestaurantProvider>
        </InviteProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
