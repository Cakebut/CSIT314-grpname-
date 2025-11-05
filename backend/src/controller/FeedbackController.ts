import { FeedbackEntity } from '../entities/feedback';
import { Request, Response } from 'express';

export class FeedbackController {
  static async addFeedback(req: Request, res: Response) {
    try {
      const { pinId, csrId, requestId, rating, description, createdAt } = req.body;
      if (!pinId || !csrId || !requestId || !rating || !createdAt) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      await FeedbackEntity.addFeedback({
        pin_id: pinId,
        csr_id: csrId,
        requestId,
        rating,
        description,
        createdAt,
      });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to save feedback' });
    }
  }
}
