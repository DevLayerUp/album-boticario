interface FigurinhaPanelProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FigurinhaPanel({ title, description, children }: FigurinhaPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
      <div className="w-full space-y-2 text-center sm:text-left">
        <h2 className="font-display text-xl font-bold text-verde-escuro-500 sm:text-2xl lg:text-[34px]">
          {title}
        </h2>
        <p className="text-sm text-verde-escuro-500/80 sm:text-base">{description}</p>
      </div>

      <div className="flex w-full flex-col items-center gap-6 rounded-block bg-verde-100 p-6 sm:p-10">
        {children}
      </div>
    </div>
  );
}
