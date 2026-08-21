'use client';

import { useEffect } from 'react';

export default function KofiFloatingWidget() {
  useEffect(() => {
    // Dynamically inject Ko-fi official overlay widget script
    const scriptId = 'kofi-overlay-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).kofiWidgetOverlay) {
          try {
            (window as any).kofiWidgetOverlay.draw('buzzerbet', {
              'type': 'floating-chat',
              'floating-chat.donateButton.text': 'Support me',
              'floating-chat.donateButton.background-color': '#f45d22',
              'floating-chat.donateButton.text-color': '#fff'
            });
          } catch (e) {
            console.error('Kofi widget initialization error:', e);
          }
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  return null;
}
