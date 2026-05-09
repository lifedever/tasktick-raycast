// src/lib/format.ts
import { Icon, Color } from "@raycast/api";
import type { Task } from "./types";

export function statusIcon(task: Task): { source: Icon; tintColor?: Color } {
    if (task.status === "running") return { source: Icon.Circle, tintColor: Color.Green };
    if (task.kind === "scheduled") return { source: Icon.Clock, tintColor: Color.Blue };
    return { source: Icon.Bolt, tintColor: Color.SecondaryText };
}

export function relativeTime(iso?: string): string {
    if (!iso) return "Never";
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return "Never";
    const diffSec = Math.max(0, (Date.now() - t) / 1000);
    if (diffSec < 60) return `${Math.floor(diffSec)}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
}
