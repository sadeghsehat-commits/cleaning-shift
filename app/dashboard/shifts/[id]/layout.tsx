// Layout for dynamic shift page - allows static export
export const dynamic = 'force-static';
export const revalidate = false;

export default function ShiftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
