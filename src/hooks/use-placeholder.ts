import { useState, useEffect } from 'react';

export function usePlaceholder(options: string[], interval = 3000) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % options.length), interval);
    return () => clearInterval(t);
  }, [options.length, interval]);
  return options[idx];
}
