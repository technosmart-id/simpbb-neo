import { os as osBase } from "@orpc/server"
import { auth } from "@/lib/auth"

export const os = osBase.$context<{
  session: typeof auth.$Infer.Session | null
}>()
