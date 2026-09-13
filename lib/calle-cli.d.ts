declare module "@call-e/cli/lib/cli.js" {
  export function runCli(
    argv: string[],
    deps?: {
      env?: NodeJS.ProcessEnv;
      stdout?: (text: string) => void;
      stderr?: (text: string) => void;
    },
  ): Promise<number>;
}
