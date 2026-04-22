// Lightweight global event bus to open the guided "missing setup" modal from anywhere.
export interface SetupPromptPayload {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

type Listener = (p: SetupPromptPayload) => void;
const listeners = new Set<Listener>();

export const openSetupPrompt = (p: SetupPromptPayload) => {
  listeners.forEach((l) => l(p));
};

export const subscribeSetupPrompt = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
