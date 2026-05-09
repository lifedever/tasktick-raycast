// src/views/tasks-list.tsx
import React, { useEffect, useState, useCallback } from "react";
import { ActionPanel, Action, List, Icon, showToast, Toast, Clipboard } from "@raycast/api";
import { tasktick, CliError } from "../lib/tasktick";
import { EventsStream } from "../lib/events";
import { statusIcon, statusAccessories } from "../lib/format";
import { LogsDetail } from "./logs-detail";
import type { Task } from "../lib/types";

interface Props {
    cliPath: string;
    prefs: { showCompletionToast: boolean; logsFormat: "text" | "json" };
}

export function TasksList({ cliPath, prefs }: Props) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const list = await tasktick.list(cliPath);
            setTasks(list);
        } catch (err) {
            const msg = err instanceof CliError ? err.message : String(err);
            await showToast({ style: Toast.Style.Failure, title: "Failed to load tasks", message: msg });
        } finally {
            setLoading(false);
        }
    }, [cliPath]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        const stream = new EventsStream(cliPath);
        const setRunning = (id: string, running: boolean) =>
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: running ? "running" : "idle" } : t)));
        stream.on("started",   ({ id }) => setRunning(id, true));
        stream.on("completed", ({ id }) => setRunning(id, false));
        return () => stream.kill();
    }, [cliPath]);

    const performAction = useCallback(async (verb: "run" | "stop" | "restart" | "reveal", task: Task) => {
        const verbCap = verb.charAt(0).toUpperCase() + verb.slice(1);
        if (prefs.showCompletionToast) {
            await showToast({ style: Toast.Style.Animated, title: `${verbCap}…`, message: task.name });
        }
        try {
            await tasktick[verb](cliPath, task.id);
            if (prefs.showCompletionToast) {
                await showToast({ style: Toast.Style.Success, title: verbCap, message: task.name });
            }
            setTimeout(() => refresh(), 2000);
        } catch (err) {
            const msg = err instanceof CliError ? err.message : String(err);
            await showToast({ style: Toast.Style.Failure, title: `${verb} failed`, message: msg });
        }
    }, [cliPath, prefs.showCompletionToast, refresh]);

    return (
        <List isLoading={isLoading} searchBarPlaceholder="Search tasks…">
            {tasks.map((task) => {
                const isRunning = task.status === "running";
                return (
                    <List.Item
                        key={task.id}
                        icon={statusIcon(task)}
                        title={task.name}
                        subtitle={task.scheduleSummary}
                        accessories={statusAccessories(task)}
                        actions={
                            <ActionPanel>
                                {isRunning ? (
                                    <>
                                        <Action title="Stop"    icon={Icon.Stop} onAction={() => performAction("stop", task)} />
                                        <Action title="Restart" icon={Icon.RotateClockwise} shortcut={{ modifiers: ["cmd"], key: "r" }} onAction={() => performAction("restart", task)} />
                                    </>
                                ) : (
                                    <>
                                        <Action title="Run"  icon={Icon.Play} onAction={() => performAction("run", task)} />
                                        <Action title="Stop" icon={Icon.Stop} onAction={() => performAction("stop", task)} />
                                    </>
                                )}
                                <Action title="Reveal in TaskTick" icon={Icon.Window}
                                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                                    onAction={() => performAction("reveal", task)} />
                                <Action.Push title="View Last Output" icon={Icon.Terminal}
                                    shortcut={{ modifiers: ["cmd"], key: "l" }}
                                    target={<LogsDetail cliPath={cliPath} taskId={task.id} taskName={task.name} format={prefs.logsFormat} />} />
                                <Action title="Copy Task ID" icon={Icon.Clipboard}
                                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                                    onAction={() => Clipboard.copy(task.id)} />
                                <Action title="Refresh List" icon={Icon.ArrowClockwise}
                                    shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
                                    onAction={() => refresh()} />
                            </ActionPanel>
                        }
                    />
                );
            })}
        </List>
    );
}
