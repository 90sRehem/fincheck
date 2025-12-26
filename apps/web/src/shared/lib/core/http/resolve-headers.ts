import type { Headers } from "./http-client";

export async function resolveHeaders(
  ...sources: Array<Headers | undefined>
): Promise<Record<string, string>> {
  const resolved = await Promise.all(
    sources.map(async (source) =>
      typeof source === "function" ? await source() : source,
    ),
  );

  return Object.assign({}, ...resolved.filter(Boolean));
}
