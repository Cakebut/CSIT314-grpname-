import { db } from '../db/client';
import { feedbackTable } from '../db/schema/aiodb';
import { eq } from 'drizzle-orm';

export class FeedbackEntity {
  static async addFeedback({ pin_id, csr_id, requestId, rating, description, createdAt }: {
    pin_id: number;
    csr_id: number;
    requestId: number;
    rating: number;
    description?: string;
    createdAt: string;
  }) {
    await db.insert(feedbackTable).values({
      pin_id,
      csr_id,
      requestId,
      rating,
      description,
      createdAt: new Date(createdAt),
    });
    // Insert notification for CSR
    await db.insert(require('../db/schema/aiodb').notificationTable).values({
      pin_id,
      csr_id,
      pin_request_id: requestId,
      type: 'feedback',
      createdAt: new Date(createdAt),
      read: 0,
    });
    return { success: true };
  }
}
