// Canvas pages bypass the app shell layout (no sidebar/topbar)
// They use their own full-screen layout via CanvasEditor
export default function CanvasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
