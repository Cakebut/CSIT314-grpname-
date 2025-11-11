import { FeedbackEntity } from '../entities/feedback';

/**
 * FeedbackController provides two helpers:
 * - addFeedbackRecord(data): a plain async service method that other server code can call.
 * - addFeedback(req,res): an Express handler kept for backward compatibility.
 */
export class FeedbackController {
  // Service method: accepts a plain object and returns the entity result (throws on error)
  static async addFeedback({ pinId, csr_id, requestId, rating, description, createdAt }: {
    pinId: number;
    csr_id: number;
    requestId: number;
    rating: number;
    description?: string;
    createdAt: string;
  }) {
    // Basic validation
    if (!pinId || !csr_id || !requestId || !rating || !createdAt) {
      throw new Error('Missing required fields');
    }
    // Delegate to entity (field names expected by entity)
    return await FeedbackEntity.addFeedback({
      pin_id: pinId,
      csr_id: csr_id,
      requestId: requestId,
      rating: rating,
      description: description ?? '',
      createdAt: createdAt,
    });
  }
}