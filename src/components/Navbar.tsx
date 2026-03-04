import { Link } from "react-router-dom";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/jetquote-logo.png";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="JetQuote" className="h-8" />
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link
                to="/generate"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-sm"
              >
                Generate Proposal
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
              <Link
                to="/generate"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-sm"
              >
                Generate Proposal
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
