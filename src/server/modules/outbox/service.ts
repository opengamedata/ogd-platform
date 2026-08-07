import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

type OutboxInput = {
  eventType: string;
  schemaVersion?: number;
  aggregateType: string;
  aggregateId: string;
  payload: Prisma.InputJsonValue;
};

export async function enqueueOutboxEvent(input: OutboxInput, client: Prisma.TransactionClient = prisma) {
  return client.outboxEvent.create({
    data: {
      eventType: input.eventType,
      schemaVersion: input.schemaVersion ?? 1,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      payloadJson: input.payload,
    },
  });
}
