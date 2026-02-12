interface AppHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, children }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-bold text-2xl tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
