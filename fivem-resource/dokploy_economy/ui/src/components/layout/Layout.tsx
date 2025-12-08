import React from 'react'
import { Sidebar } from './Sidebar'

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-[85vh] w-[90vw] max-w-[1600px] bg-[#0c0c0f]/90 text-white rounded-[30px] overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl relative">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

            <Sidebar />
            <main className="flex-1 h-full overflow-hidden relative">
                <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
