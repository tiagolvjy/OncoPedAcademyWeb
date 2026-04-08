import App from "next/app";
import React from "react";

export interface AppMainContainerProps {
    title: string;
    children?: React.ReactNode;
}

export default function AppMainContainer({title, children}: AppMainContainerProps) {

    return (
         <main className="flex flex-col flex-1">
            {/* HEADER */}
            <div className="h-[50px] bg-(--background-primary) mb-[5px] p-[10px] pl-[50px]">
                OncoPed Academy
            </div>
            <header className="min-h-[100px] bg-(--background-primary) pt-[10px] pl-[50px] rounded-es-xl mb-[30px]">
                <h1 className="font-bold text-[30px]" > {title} </h1>
            </header>

            <section className="flex-1 bg-(--background-primary) p-[20px] rounded-ss-xl">
                {children}
            </section>

        </main>
    )

}