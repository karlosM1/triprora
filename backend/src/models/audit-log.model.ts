import type { Prisma } from '@prisma/client'
import { logger } from '../lib/logger.js'
import { prisma } from '../lib/prisma.js'

export type AuditLogInput = {
  actorProfileId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: Prisma.InputJsonValue
  after?: Prisma.InputJsonValue
  metadata?: Prisma.InputJsonValue
  ip?: string | null
}

export const AuditLogModel = {
  /**
   * Record a privileged admin action. Best-effort: an audit write must never
   * break the underlying operation, so failures are logged, not thrown.
   */
  async record(input: AuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorProfileId: input.actorProfileId ?? null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId ?? null,
          before: input.before,
          after: input.after,
          metadata: input.metadata,
          ip: input.ip ?? null,
        },
      })
    } catch (error) {
      logger.error('Failed to write audit log', {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        error,
      })
    }
  },
}
