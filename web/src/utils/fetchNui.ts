import { isEnvBrowser } from "./misc";

/**
 * Simple wrapper around fetch API tailored for CEF/NUI use.
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 * @param mockData - Mock data to be returned if in the browser
 */
export async function fetchNui<T = any>(
    eventName: string,
    data?: any,
    mockData?: T
): Promise<T> {
    const options = {
        method: "post",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(data),
    };

    if (isEnvBrowser()) {
        if (mockData) return mockData;
        console.log(`Browser environment detected. Mocking NUI event: ${eventName}`, data);
        return {} as T;
    }

    const resourceName = (window as any).GetParentResourceName
        ? (window as any).GetParentResourceName()
        : "nui-frame-app";

    const resp = await fetch(`https://${resourceName}/${eventName}`, options);

    const respFormatted = await resp.json();

    return respFormatted;
}
