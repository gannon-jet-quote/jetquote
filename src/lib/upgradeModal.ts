// Lightweight global event bus to open the Upgrade-to-Pro modal from anywhere.
type Listener = (feature: string) => void;
const listeners = new Set<Listener>();

export const openUpgradeModal = (feature = "This feature") => {
  listeners.forEach((l) => l(feature));
};

export const subscribeUpgradeModal = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
