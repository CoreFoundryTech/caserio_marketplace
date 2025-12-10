import React from 'react'
import { Sidebar } from './Sidebar'

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="flex h-[85vh] w-[90vw] max-w-[1600px] text-white rounded-[30px] overflow-hidden shadow-2xl border border-white/10 relative gpu-layer"
            style={{
                background: 'rgba(12, 12, 15, 0.95)',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
            }}
        >
            <Sidebar />
            <main className="flex-1 h-full overflow-hidden relative">
                <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    )
}
