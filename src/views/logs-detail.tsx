// src/views/logs-detail.tsx
import React from "react";
import { Detail, ActionPanel, Action, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { tasktick, CliError } from "../lib/tasktick";
import type { ExecutionLog } from "../lib/types";

interface Props {
    cliPath: string;
    taskId: string;
    taskName: string;
    format: "text" | "json";
}

export function LogsDetail({ cliPath, taskId, taskName, format }: Props) {
    const [log, setLog] = useState<ExecutionLog | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        tasktick.logs(cliPath, taskId)
            .then(setLog)
            .catch((err) => setError(err instanceof CliError ? err.message : String(err)));
    }, [cliPath, taskId]);

    let markdown: string;
    if (error) {
        markdown = `# ${taskName}\n\n\`\`\`\n${error}\n\`\`\``;
    } else if (!log) {
        markdown = `# ${taskName}\n\nLoading…`;
    } else if (format === "json") {
        markdown = `# ${taskName}\n\n\`\`\`json\n${JSON.stringify(log, null, 2)}\n\`\`\``;
    } else {
        const exit = log.exitCode ?? "?";
        const lines = log.lines
            .map((l) => `[${l.ts.slice(11, 19)}] ${l.stream === "stderr" ? "⚠ " : "  "}${l.text}`)
            .join("\n");
        markdown = `# ${taskName}\n\nExit ${exit}\n\n\`\`\`\n${lines || "(no output)"}\n\`\`\``;
    }

    return (
        <Detail
            isLoading={!log && !error}
            markdown={markdown}
            actions={
                <ActionPanel>
                    {log && <Action.CopyToClipboard title="Copy Output" content={log.lines.map((l) => l.text).join("\n")} />}
                    <Action.OpenInBrowser title="Reveal Task in TaskTick"
                        url={`tasktick://reveal?id=${taskId}`} icon={Icon.Window} />
                </ActionPanel>
            }
        />
    );
}
