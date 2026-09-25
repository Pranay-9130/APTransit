import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../../config/env";

export interface EmailProvider {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export const EMAIL_PROVIDER = "EMAIL_PROVIDER";

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const isTestDomain = to.toLowerCase().endsWith(".test");
    const appEnv = this.config.get("APP_ENV", { infer: true });
    const nodeEnv = this.config.get("NODE_ENV", { infer: true });

    if (isTestDomain || nodeEnv === "test" || appEnv === "development") {
      this.logger.log(`[Dev/Test Email] To: ${to} | Subject: ${subject} | Body: ${body}`);
      return;
    }

    const apiKey = this.config.get("RESEND_API_KEY", { infer: true });
    const from = this.config.get("EMAIL_FROM", { infer: true });

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          text: body,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Resend email delivery failed: ${response.status} ${errorText}`);
      }
    } catch (err) {
      this.logger.error("Failed to send email via Resend", err);
    }
  }
}
