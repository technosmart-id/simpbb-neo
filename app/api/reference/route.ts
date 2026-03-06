import { ApiReference } from "@scalar/nextjs-api-reference";

const config = {
  spec: {
    url: "/api/openapi.json",
  },
  // If we could merge them it would be better, but for now let's see if Scalar supports multiple URLs or if we need to fetch and merge manually.
  // Actually, `@scalar/nextjs-api-reference` config is a bit limited in the simple setup.
  // Let's check if we can pass multiple specs.
};

// biome-ignore lint/suspicious/noExplicitAny: Library type mismatch
export const GET = ApiReference(config as any);
