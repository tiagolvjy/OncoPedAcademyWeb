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
      <div className="flex flex-1 ml-[30px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}