import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { NextConfig } from "next";

/**
 * Next carga los archivos .env después de evaluar next.config.ts, así que
 * leemos el valor acá para inlinearlo en el bundle del cliente. Sin esto, el
 * build estático deja process.env.NEXT_PUBLIC_API_BASE_URL sin resolver y el
 * navegador cae al fallback de localhost. Si NEXT_PUBLIC_API_BASE_URL no está
 * definido, usamos API_BASE_URL de la configuración local.
 */
function readEnvValue(key: string): string | undefined {
  for (const file of [".env.local", ".env.production", ".env"]) {
    try {
      const contents = readFileSync(join(process.cwd(), file), "utf8");

      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*)\\s*$`));
        if (match) {
          const value = match[1].trim().replace(/^["']|["']$/g, "");
          if (value) {
            return value;
          }
        }
      }
    } catch {
      // El archivo no existe; probamos el siguiente.
    }
  }

  return process.env[key];
}

const apiBaseUrl =
  readEnvValue("NEXT_PUBLIC_API_BASE_URL") ?? readEnvValue("API_BASE_URL");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  ...(apiBaseUrl ? { env: { NEXT_PUBLIC_API_BASE_URL: apiBaseUrl } } : {}),
  images: {
    unoptimized: true,
  },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
