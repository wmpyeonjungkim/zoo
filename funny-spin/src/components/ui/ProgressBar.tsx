interface ProgressBarProps {
  current: number;
  max: number;
  colorClass?: string;
}

export default function ProgressBar({ current, max, colorClass = 'bg-amber-400' }: ProgressBarProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
            i < current ? colorClass : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}
