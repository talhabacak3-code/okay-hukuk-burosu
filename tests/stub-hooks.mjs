import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const src = new URL("../src/", import.meta.url)

export async function resolve(specifier, context, next) {
  // server-only paketi Next.js içinde çözülür; düz Node testlerinde boş modüle yönlendirilir.
  if (specifier === "server-only")
    return { url: "data:text/javascript,export{}", shortCircuit: true }
  // tsconfig "@/*" → "./src/*" takma adı (uzantısız içe aktarımlar .ts/.tsx olarak çözülür).
  if (specifier.startsWith("@/")) {
    const base = new URL(specifier.slice(2), src)
    for (const candidate of [".ts", ".tsx", "/index.ts"]) {
      const url = new URL(base.href + candidate)
      if (existsSync(fileURLToPath(url)))
        return { url: url.href, shortCircuit: true }
    }
  }
  return next(specifier, context)
}
