import { Metadata } from "next";
import React from "react";
import { AppMenu } from "@/themes/components";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | OncoPed Academy",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-(--background-secondary) flex h-screen overflow-hidden">
      {/* MENU */}
      <AppMenu />

      {/* MAIN */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* HEADER */}
        <header className="bg-(--background-primary) border-b border-[#e5e7eb] px-6 h-[56px] flex items-center justify-between flex-shrink-0">
            <span className="text-[15px] font-semibold text-[#374151]">OncoPed Academy — Gerenciador</span>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* FOOTER */}
        <footer className="bg-(--background-primary) border-t border-[#e5e7eb] px-6 h-[40px] flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] text-[#9ca3af]">
            © {new Date().getFullYear()} OncoPed Academy — Todos os direitos reservados.
          </span>
        </footer>
      </div>
    </div>
  );
}