// src/search-tasks.tsx
import React, { useEffect, useState } from "react";
import { Detail, getPreferenceValues } from "@raycast/api";
import { resolveCliPath } from "./lib/cli-detection";
import { TasksList } from "./views/tasks-list";

interface Prefs {
    cliPath?: string;
    showCompletionToast: boolean;
    logsFormat: "text" | "json";
}

export default function Command() {
    const prefs = getPreferenceValues<Prefs>();
    const [cliPath, setCliPath] = useState<string | null | undefined>(undefined);

    useEffect(() => { resolveCliPath(prefs.cliPath).then(setCliPath); }, [prefs.cliPath]);

    if (cliPath === undefined) return <Detail isLoading markdown="" />;
    if (cliPath === null) return <CliNotFound />;
    return <TasksList cliPath={cliPath} prefs={prefs} />;
}

// TODO: Task 12 will replace this with a real CliNotFound in src/views/cli-not-found.tsx
function CliNotFound() {
    return <Detail markdown="CLI not found — placeholder, replaced in Task 12." />;
}
