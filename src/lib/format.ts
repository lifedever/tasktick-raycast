// src/lib/format.ts
import { Icon, Color, List } from "@raycast/api";
import type { Task } from "./types";

/**
 * Visual hierarchy for the leading list-item icon:
 *   - running   → animated-feel green circle-progress
 *   - scheduled → blue calendar-clock (calendar reads as "scheduled" better than just clock)
 *   - manual    → purple play arrow (user-triggered)
 *
 * `disabled` tasks dim the whole row regardless of kind.
 */
export function statusIcon(task: Task): List.Item.Props["icon"] {
    if (!task.enabled) {
        return { source: Icon.MinusCircle, tintColor: Color.SecondaryText };
    }
    if (task.status === "running") {
        return { source: Icon.CircleProgress, tintColor: Color.Green };
    }
    if (task.kind === "scheduled") {
        return { source: Icon.Calendar, tintColor: Color.Blue };
    }
    return { source: Icon.Play, tintColor: Color.Purple };
}

/** Right-side accessory: kind chip + enabled marker + relative time. */
export function statusAccessories(task: Task): List.Item.Accessory[] {
    const accessories: List.Item.Accessory[] = [];
    if (task.status === "running") {
        accessories.push({
            tag: { value: "Running", color: Color.Green },
            tooltip: "This task is currently executing"
        });
    }
    accessories.push({ text: relativeTime(task.lastRunAt), tooltip: "Last run" });
    return accessories;
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
