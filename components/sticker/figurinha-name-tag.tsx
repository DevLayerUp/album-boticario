interface FigurinhaNameTagProps {
  name: string;
  className?: string;
}

export function FigurinhaNameTag({ name, className }: FigurinhaNameTagProps) {
  const label = name.trim();
  if (!label) return null;

  return (
    <p
      className={`mt-3 text-center font-display text-lg font-bold uppercase leading-tight text-white sm:text-xl ${className ?? ""}`}
    >
      {label}
    </p>
  );
}
