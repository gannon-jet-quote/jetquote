import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Clock, Award } from "lucide-react";
import Navbar from "@/components/Navbar";

const benefits = [
  { icon: Award, title: "Win More Jobs", desc: "Professional proposals that build trust and close deals." },
  { icon: Clock, title: "Seconds, Not Hours", desc: "Generate polished quotes instantly with AI." },
  { icon: Zap, title: "Look Premium", desc: "Stand out with credible, branded proposals." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
        {/* Glow effect */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            AI-Powered Proposals
          </div>

          <h1 className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Create Professional Service Proposals{" "}
            <span className="gradient-text">in Seconds</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
            JetQuote helps pressure washing, landscaping, and cleaning businesses win more jobs with professional AI-generated proposals.
          </p>

          <Link
            to="/generate"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:brightness-110 glow-md animate-pulse-glow"
          >
            Generate a Proposal
            <Zap className="h-5 w-5" />
          </Link>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-10 mt-24 grid max-w-4xl gap-6 md:grid-cols-3"
        >
          {benefits.map((b, i) => (
            <div
              key={i}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-secondary"
            >
              <b.icon className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
