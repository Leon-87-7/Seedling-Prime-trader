'use client';
import { useEffect, useRef, useState } from 'react';

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.dataset.loaded) return;

    setIsLoading(true);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.innerHTML = JSON.stringify(config);

    script.onload = () => {
      // Give the widget a moment to render
      timeoutId = setTimeout(() => setIsLoading(false), 1000);
    };

    script.onerror = () => {
      setIsLoading(false);
    };

    const container = containerRef.current;
    container.appendChild(script);
    container.dataset.loaded = 'true';

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (container) {
        container.innerHTML = '';
        delete container.dataset.loaded;
      }
    };
  }, [scriptUrl, config, height]);

  return { containerRef, isLoading };
};

export default useTradingViewWidget;
