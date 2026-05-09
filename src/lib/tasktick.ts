// src/lib/tasktick.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { ExecutionLog, Task } from "./types";

const execFileAsync = promisify(execFile);

export class CliError extends Error {
    constructor(public readonly stderr: string, public readonly exitCode: number) {
        super(stderr.split("\n")[0] || `tasktick exited with code ${exitCode}`);
    }
}

async function runJSON<T>(cliPath: string, args: string[]): Promise<T> {
    try {
        const { stdout } = await execFileAsync(cliPath, [...args, "--json"], { maxBuffer: 16 * 1024 * 1024 });
        return JSON.parse(stdout) as T;
    } catch (err: any) {
        if (typeof err?.code === "number" || typeof err?.code === "string") {
            throw new CliError(err.stderr ?? String(err), Number(err.code) || 1);
        }
        throw err;
    }
}

async function runVoid(cliPath: string, args: string[]): Promise<void> {
    try {
        await execFileAsync(cliPath, args);
    } catch (err: any) {
        throw new CliError(err.stderr ?? String(err), Number(err.code) || 1);
    }
}

export const tasktick = {
    list: (cliPath: string) => runJSON<Task[]>(cliPath, ["list"]),
    status: (cliPath: string, id?: string) => runJSON<unknown>(cliPath, id ? ["status", id] : ["status"]),
    logs:  (cliPath: string, id: string) => runJSON<ExecutionLog>(cliPath, ["logs", id]),
    run:     (cliPath: string, id: string) => runVoid(cliPath, ["run", id]),
    stop:    (cliPath: string, id: string) => runVoid(cliPath, ["stop", id]),
    restart: (cliPath: string, id: string) => runVoid(cliPath, ["restart", id]),
    reveal:  (cliPath: string, id: string) => runVoid(cliPath, ["reveal", id])
};
