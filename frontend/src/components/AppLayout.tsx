import { PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex">

      <Sidebar />
      <main className="flex-1 bg-white min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
