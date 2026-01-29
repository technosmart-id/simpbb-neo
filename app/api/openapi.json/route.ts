import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { NextResponse } from "next/server";
import { router } from "@/lib/orpc/router";

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export async function GET() {
  const spec = await generator.generate(router, {
    info: {
      title: "SimPBB Neo API",
      version: "1.0.0",
      description: "API Documentation for SimPBB Neo",
    },
    servers: [
      {
        url: "/api/rpc",
        description: "Main API Server",
      },
    ],
  });

  // Post-process tags for better grouping in Scalar
  // Post-process tags for better grouping in Scalar
  if (spec.paths) {
    for (const [path, methods] of Object.entries(spec.paths)) {
      // biome-ignore lint/suspicious/noExplicitAny: methods is a complex OpenAPI object
      for (const operation of Object.values(methods as any)) {
        // biome-ignore lint/suspicious/noExplicitAny: operation needs to be mutated
        (operation as any).tags = getTagsForPath(path);
      }
    }
  }

  // Force OpenAPI 3.0.3 for better compatibility with Swagger UI
  // Force OpenAPI 3.0.3 for better compatibility with Swagger UI
  // oRPC generates 3.1.1 by default which causes "refract is not a function" in Turbopack/Next.js
  // biome-ignore lint/suspicious/noExplicitAny: Intentional override to fix Swagger UI
  (spec as any).openapi = "3.0.3";

  return NextResponse.json(spec);
}

function getTagsForPath(path: string): string[] {
  if (path.startsWith("/op")) {
    return ["Objek Pajak"];
  }
  if (path.startsWith("/sppt")) {
    return ["SPPT"];
  }
  if (path.startsWith("/pembayaran")) {
    return ["Pembayaran"];
  }
  if (path.startsWith("/wilayah")) {
    return ["Wilayah"];
  }
  if (path === "/health" || path === "/me") {
    return ["System"];
  }
  return ["Other"];
}
