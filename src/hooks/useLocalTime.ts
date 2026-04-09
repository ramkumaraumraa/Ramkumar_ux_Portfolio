import { useEffect, useState } from 'react';

const INDIA_TIMEZONE = 'Asia/Kolkata';

function formatLocalTime() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

export function useLocalTime() {
  const [localTime, setLocalTime] = useState('--:--');

  useEffect(() => {
    const updateTime = () => setLocalTime(formatLocalTime());

    updateTime();
    const interval = window.setInterval(updateTime, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return localTime;
}
