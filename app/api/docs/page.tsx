"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-primary border-t-2 border-b-2" />
    </div>
  ),
});

export default function SwaggerDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        defaultModelsExpandDepth={-1}
        docExpansion="list"
        persistAuthorization={true}
        url="/api/openapi.json"
      />
    </div>
  );
}
