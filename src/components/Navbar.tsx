import { Link } from "react-router-dom";
import logo from "@/assets/jetquote-logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="JetQuote" className="h-8" />
        </Link>
        <Link
          to="/generate"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-sm"
        >
          Generate Proposal
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
