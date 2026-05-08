/**
 * Drizzle ORM adapter for Casbin
 *
 * This adapter implements the Casbin Adapter interface to work with Drizzle ORM.
 * It stores policies in a generic casbin_rule table with flexible v0-v5 columns.
 */

import { type Adapter } from "casbin"
import { db } from "@/lib/db"
import { casbinRule } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

type CasbinRuleRecord = {
  id: string
  ptype: string
  v0?: string | null
  v1?: string | null
  v2?: string | null
  v3?: string | null
  v4?: string | null
  v5?: string | null
}

export class DrizzleAdapter implements Adapter {
  private tableName = "casbin_rule"

  constructor() {
    // No need to store db, we use the imported singleton
  }

  /**
   * Load all policies from the database
   */
  async loadPolicy(model: any): Promise<void> {
    const rules = await db
      .select({
        id: casbinRule.id,
        ptype: casbinRule.ptype,
        v0: casbinRule.v0,
        v1: casbinRule.v1,
        v2: casbinRule.v2,
        v3: casbinRule.v3,
        v4: casbinRule.v4,
        v5: casbinRule.v5,
      })
      .from(casbinRule)

    for (const rule of rules) {
      const ruleArray = this.ruleToArray(rule)
      if (ruleArray && ruleArray.length > 0) {
        // Casbin 5.x expects arrays for loadPolicyLine
        const ptype = ruleArray[0]
        const ruleData = ruleArray.slice(1)

        const sec = ptype === "p" ? "p" : "g"
        const assertion = model.model.get(sec)?.get(ptype)

        if (assertion) {
          assertion.policy.push(ruleData)
        }
      }
    }
  }

  /**
   * Save all policies to the database
   */
  async savePolicy(model: any): Promise<boolean> {
    // Delete all existing policies
    await db.delete(casbinRule)

    const sections = ["p", "g"]
    for (const sec of sections) {
      const section = model.model.get(sec)
      if (!section) continue

      for (const [ptype, assertion] of section) {
        for (const rule of assertion.policy) {
          const line = this.filterRuleToLine(ptype, rule)
          const record = this.lineToRule(line)
          if (record) {
            await db.insert(casbinRule).values(record)
          }
        }
      }
    }

    return true
  }

  /**
   * Add a policy to the database
   */
  async addPolicy(_sec: string, ptype: string, rule: string[]): Promise<void> {
    const line = this.filterRuleToLine(ptype, rule)
    const record = this.lineToRule(line)

    if (record) {
      await db.insert(casbinRule).values(record)
    }
  }

  /**
   * Remove a policy from the database
   */
  async removePolicy(_sec: string, ptype: string, rule: string[]): Promise<void> {
    const parts = [ptype, ...rule]
    const conditions = this.buildConditions(parts)

    if (Object.keys(conditions).length > 0) {
      await db.delete(casbinRule).where(conditions)
    }
  }

  /**
   * Remove filtered policies from the database
   */
  async removeFilteredPolicy(
    _sec: string,
    ptype: string,
    fieldIndex: number,
    ...fieldValues: string[]
  ): Promise<void> {
    // Build conditions based on fieldIndex and fieldValues
    // fieldIndex 0 = v0, 1 = v1, etc.
    const conditions: any[] = [eq(casbinRule.ptype, ptype)]

    const fieldMap = [casbinRule.v0, casbinRule.v1, casbinRule.v2, casbinRule.v3, casbinRule.v4, casbinRule.v5]

    for (let i = 0; i < fieldValues.length; i++) {
      const value = fieldValues[i]
      if (value !== "") {
        const col = fieldMap[fieldIndex + i]
        if (col) {
          conditions.push(eq(col, value))
        }
      }
    }

    if (conditions.length > 1) {
      await db.delete(casbinRule).where(and(...conditions))
    } else if (conditions.length === 1) {
      await db.delete(casbinRule).where(conditions[0])
    }
  }

  /**
   * Convert a database rule to a policy line string
   */
  private ruleToLine(rule: CasbinRuleRecord): string | null {
    if (!rule.ptype) return null

    const parts = [rule.ptype]
    if (rule.v0) parts.push(rule.v0)
    if (rule.v1) parts.push(rule.v1)
    if (rule.v2) parts.push(rule.v2)
    if (rule.v3) parts.push(rule.v3)
    if (rule.v4) parts.push(rule.v4)
    if (rule.v5) parts.push(rule.v5)

    return parts.join(", ")
  }

  /**
   * Convert a database rule to an array
   */
  private ruleToArray(rule: CasbinRuleRecord): string[] {
    const parts: string[] = [rule.ptype]
    const values = [rule.v0, rule.v1, rule.v2, rule.v3, rule.v4, rule.v5]
    
    let lastIndex = values.length - 1
    while (lastIndex >= 0 && (values[lastIndex] === null || values[lastIndex] === undefined)) {
      lastIndex--
    }

    for (let i = 0; i <= lastIndex; i++) {
      parts.push(values[i] ?? "")
    }

    return parts
  }

  /**
   * Convert a policy rule array to a line string
   */
  private ruleArrayToLine(rule: string[]): string {
    return rule.join(", ")
  }

  /**
   * Convert a policy line string to a database rule
   */
  private lineToRule(line: string): CasbinRuleRecord | null {
    const parts = line.split(",").map((s) => s.trim())
    if (parts.length === 0 || !parts[0]) return null

    return {
      id: crypto.randomUUID(),
      ptype: parts[0],
      v0: parts[1] ?? null,
      v1: parts[2] ?? null,
      v2: parts[3] ?? null,
      v3: parts[4] ?? null,
      v4: parts[5] ?? null,
      v5: parts[6] ?? null,
    }
  }

  /**
   * Convert filter params to policy line
   */
  private filterRuleToLine(ptype: string, rule: string[]): string {
    const parts = [ptype, ...rule]
    // Filter out null/undefined but KEEP empty strings which are used for global domains
    return parts.filter(p => p !== null && p !== undefined).join(", ")
  }

  /**
   * Build Drizzle conditions from policy parts
   */
  private buildConditions(parts: string[]): any {
    const conditions: any[] = []

    if (parts[0]) conditions.push(eq(casbinRule.ptype, parts[0]))
    if (parts[1]) conditions.push(eq(casbinRule.v0, parts[1]))
    if (parts[2]) conditions.push(eq(casbinRule.v1, parts[2]))
    if (parts[3]) conditions.push(eq(casbinRule.v2, parts[3]))
    if (parts[4]) conditions.push(eq(casbinRule.v3, parts[4]))
    if (parts[5]) conditions.push(eq(casbinRule.v4, parts[5]))
    if (parts[6]) conditions.push(eq(casbinRule.v5, parts[6]))

    return and(...conditions)
  }
}

/**
 * Helper function to create a Drizzle adapter
 */
export function createDrizzleAdapter(): DrizzleAdapter {
  return new DrizzleAdapter()
}
