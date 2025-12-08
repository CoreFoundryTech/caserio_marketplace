import React, { createContext, useContext, useEffect, useState } from "react";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";

const VisibilityContext = createContext({
    visible: false,
    setVisible: (_: boolean) => { },
});

export const useVisibility = () => useContext(VisibilityContext);

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [visible, setVisible] = useState(isEnvBrowser());

    useNuiEvent<boolean>("setVisible", (bool) => {
        setVisible(bool);
    });

    useEffect(() => {
        // Only attach listener when we are visible
        if (!visible) return;

        const keyHandler = (e: KeyboardEvent) => {
            if (["Escape"].includes(e.code)) {
                if (!isEnvBrowser()) fetchNui("hideFrame");
                else setVisible(false);
            }
        };

        window.addEventListener("keydown", keyHandler);

        return () => window.removeEventListener("keydown", keyHandler);
    }, [visible]);

    return (
        <VisibilityContext.Provider
            value={{
                visible,
                setVisible,
            }}
        >
            <div style={{ visibility: visible ? "visible" : "hidden", height: '100%' }}>
                {children}
            </div>
        </VisibilityContext.Provider>
    );
};
