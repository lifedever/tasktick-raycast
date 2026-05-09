// src/lib/cli-detection.ts
import { promises as fs, constants as fsConstants } from "node:fs";

const DEFAULT_FALLBACKS = [
    "/usr/local/bin/tasktick",
    "/opt/homebrew/bin/tasktick",
    "/Applications/TaskTick.app/Contents/MacOS/tasktick"
];

async function isExecutable(path: string): Promise<boolean> {
    try {
        await fs.access(path, fsConstants.X_OK);
        return true;
    } catch {
        return false;
    }
}

/**
 * Resolves the first existing + executable path.
 * @param preferred Optional user-supplied path from preferences.
 * @param fallbacks Override default fallback chain (mainly for tests).
 */
export async function resolveCliPath(
    preferred: string | undefined,
    fallbacks: string[] = DEFAULT_FALLBACKS
): Promise<string | null> {
    if (preferred && preferred.trim().length > 0) {
        return (await isExecutable(preferred)) ? preferred : null;
    }
    for (const candidate of fallbacks) {
        if (await isExecutable(candidate)) return candidate;
    }
    return null;
}

export const CLI_FALLBACK_PATHS = DEFAULT_FALLBACKS;
