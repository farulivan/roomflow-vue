import type { TypedSchema, TypedSchemaError } from "vee-validate"
import type { z } from "zod"

/** A Zod issue path as vee-validate writes field paths: "items[0].name". */
function toFieldPath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((joined, key) => {
    if (typeof key === "number") return `${joined}[${key}]`
    return joined ? `${joined}.${String(key)}` : String(key)
  }, "")
}

/**
 * Lets a vee-validate form validate with a Zod 4 schema, and takes the
 * form's value types from it. vee-validate's own adapter
 * (@vee-validate/zod) still expects Zod 3; this implements the same small
 * `TypedSchema` contract by hand. vee-validate 5 reads Zod schemas
 * directly, so this file goes away with that upgrade.
 */
export function toTypedSchema<Schema extends z.ZodType>(
  schema: Schema
): TypedSchema<z.input<Schema>, z.output<Schema>> {
  return {
    __type: "VVTypedSchema",
    async parse(values) {
      const result = await schema.safeParseAsync(values)
      if (result.success) return { value: result.data, errors: [] }

      const messagesByPath = new Map<string, string[]>()
      for (const issue of result.error.issues) {
        const path = toFieldPath(issue.path)
        messagesByPath.set(path, [
          ...(messagesByPath.get(path) ?? []),
          issue.message,
        ])
      }
      const errors: TypedSchemaError[] = [...messagesByPath].map(
        ([path, messages]) => ({ path, errors: messages })
      )
      return { errors }
    },
  }
}
