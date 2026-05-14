import { useEffect, useState } from 'react';

const isUSFormat = () => {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(new Date(2026, 0, 2));
    const order = parts.filter((p) => p.type !== 'literal').map((p) => p.type);
    return order[0] === 'month';
  } catch {
    return (navigator.language || '').toLowerCase() === 'en-us';
  }
};

interface ClockProps {
  entering?: boolean;
}

const Clock = ({ entering = false }: ClockProps) => {
  const [now, setNow] = useState(() => new Date());
  const [usFormat] = useState(isUSFormat);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const h = now.getHours();
  const min = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');

  const date = usFormat ? `${m} ${d} ${y}` : `${d} ${m} ${y}`;
  const time = `${h}:${min}:${s}`;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-foreground font-mono uppercase tracking-wider gap-2 transition-all duration-500 ease-out ${entering ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <div className="text-base">{date}</div>
      <div className="text-base">{time}</div>
    </div>
  );
};

export default Clock;
