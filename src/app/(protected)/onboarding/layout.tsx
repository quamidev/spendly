export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
