import { Outlet } from "react-router-dom";
import { AppTopNav } from "@/components/layout/AppTopNav";
import { AppFooter } from "@/components/layout/AppFooter";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex w-full flex-col bg-background">
      <AppTopNav />
      <main className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
