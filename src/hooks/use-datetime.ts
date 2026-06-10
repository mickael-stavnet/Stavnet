import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

export function useDateTime() {
  const locale = useLocale();
  const [dateTime, setDateTime] = useState({
    date: '',
    time: ''
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime({
        date: now.toLocaleDateString(locale, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: now.toLocaleTimeString(locale, { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      });
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [locale]);

  return dateTime;
}
