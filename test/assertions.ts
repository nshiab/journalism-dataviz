import { expect } from "vite-plus/test";
export {
  deepStrictEqual as assertEquals,
  strictEqual as assertStrictEquals,
} from "node:assert/strict";
export function assertStringIncludes(actual: unknown, expected: string): void {
  expect(actual).toEqual(expect.stringContaining(expected));
}
export async function assertRejects(
  fn: () => unknown,
  ErrorType = Error,
  message?: string,
): Promise<Error> {
  try {
    await fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ErrorType);
    if (!(error instanceof Error)) throw error;
    if (message !== undefined) expect(error.message).toContain(message);
    return error;
  }
  throw new Error("Expected the operation to reject");
}
export async function step(_name: string, fn: () => unknown): Promise<void> {
  await fn();
}
