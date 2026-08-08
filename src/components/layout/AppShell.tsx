import { Link, useLocation } from "wouter";
import { SearchIcon, UserCircleIcon, HomeIcon, BookmarkIcon, UtensilsIcon, UserIcon } from "lucide-react";
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="mx-auto max-w-[430px] min-h-[100dvh] bg-background shadow-2xl relative flex flex-col overflow-hidden">
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-background/90 backdrop-blur-md border-b border-border">
        <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">Sepiring</h1>
        <div className="flex items-center gap-1 text-foreground">
          <Link href="/search" className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="link-search">
            <SearchIcon className="w-5 h-5" />
          </Link>
          <Link href="/profil" className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="link-profil-header">
            <UserCircleIcon className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="absolute bottom-0 left-0 right-0 bg-card border-t border-border flex items-center justify-around py-2 px-2 z-10 pb-4">
        <NavItem href="/" icon={<HomeIcon className="w-5 h-5" />} label="Beranda" active={location === "/"} />
        <NavItem href="/wishlist" icon={<BookmarkIcon className="w-5 h-5" />} label="Wishlist" active={location === "/wishlist"} />
        <NavItem href="/peta-rasa" icon={<UtensilsIcon className="w-5 h-5" />} label="Riwayat" active={location === "/peta-rasa"} />
        <NavItem href="/profil" icon={<UserIcon className="w-5 h-5" />} label="Profil" active={location === "/profil"} />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
