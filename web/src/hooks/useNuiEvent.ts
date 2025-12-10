import { useEffect, useRef } from "react";

interface NuiMessageData<T = unknown> {
    action: string;
    data: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * A hook that manages event listeners for NUI messages.
 * @param action The specific action to listen for.
 * @param handler The callback function when the action is triggered.
 */
export const useNuiEvent = <T = any>(
    action: string,
    handler: (data: T) => void
) => {
    const savedHandler = useRef<NuiHandlerSignature<T> | undefined>(undefined);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventListener = (event: MessageEvent<NuiMessageData<T>>) => {
            const { action: eventAction, data } = event.data;

            if (savedHandler.current && eventAction === action) {
                savedHandler.current(data);
            }
        };

        window.addEventListener("message", eventListener);
        return () => window.removeEventListener("message", eventListener);
    }, [action]);
};
