import "server-only";

import { Tool } from "ai";
import { fetchTool, multiFetchTool, searchTool } from "./search";

type WebToolNames = "fetch" | "search" | "multiFetch";

export const getWebTools = (config?: {
    excludeTools?: WebToolNames[];
}): Partial<Record<WebToolNames, Tool>> => {
    const tools: Partial<Record<WebToolNames, Tool>> = {
        fetch: fetchTool,
        search: searchTool,
        multiFetch: multiFetchTool,
    };

    // Exclude any tools specified in the configuration.
    if (config?.excludeTools) {
        config.excludeTools.forEach((toolName) => {
            delete tools[toolName];
        });
    }
    return tools;
};
