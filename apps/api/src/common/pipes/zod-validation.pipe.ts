import { type ArgumentMetadata, Injectable, type PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/app-error";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema?: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (!this.schema) {
      return value;
    }
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const details: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") || "value";
        details[path] = issue.message;
      }
      throw new AppError("VALIDATION_FAILED", "Validation failed", details);
    }
    return result.data;
  }
}
