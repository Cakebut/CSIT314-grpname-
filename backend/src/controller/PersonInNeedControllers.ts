import { notificationTable, useraccountTable, pin_requestsTable } from '../db/schema/aiodb';
import { db } from '../db/client';
import { eq, desc, not, and } from 'drizzle-orm';

import { PinRequestEntity, PinRequest } from '../entities/personInNeedrequests';

export class PersonInNeedControllers {
  // Fetch notifications for a CSR user
  async getNotificationsForCsr(csr_id: number) {
    return await PinRequestEntity.getNotificationsForCsr(csr_id);
  }
  // My Offers: Get all requests for a PIN user, with interested CSRs for each
  async getOffersByPinId(pin_id: number) {
    return await PinRequestEntity.getOffersByPinId(pin_id);
  }

  // Accept a CSR for a request
  async acceptCsrForRequest(requestId: number, csrId: number) {
    return await PinRequestEntity.acceptCsrForRequest(requestId, csrId);
  }

  // Cancel a CSR's interest for a request
  async cancelCsrInterest(requestId: number, csrId: number) {
    return await PinRequestEntity.cancelCsrInterest(requestId, csrId);
  }
  // Fetch notifications for a PIN user
  async getNotifications(pin_id: number) {
    return await PinRequestEntity.getNotifications(pin_id);
  }

  async deleteNotification(id: number) {
    await db.delete(notificationTable).where(eq(notificationTable.id, id));
  }
  // Download CSV history for a specific PIN user
  async getRequestsHistoryCSVByPinId(pin_id: number): Promise<string> {
    return await PinRequestEntity.getRequestsHistoryCSVByPinId(pin_id);
  }
  async incrementViewCount(requestId: number): Promise<void> {
    await PinRequestEntity.incrementViewCount(requestId);
  }

  async incrementShortlistCount(requestId: number): Promise<void> {
    await PinRequestEntity.incrementShortlistCount(requestId);
  }
  async getAllRequests(): Promise<PinRequest[]> {
    return await PinRequestEntity.getAllRequests();
  }

  async getRequestsByPinId(pin_id: number): Promise<PinRequest[]> {
    return await PinRequestEntity.getRequestsByPinId(pin_id);
  }

  async createRequest(data: Omit<PinRequest, 'id' | 'createdAt' | 'status' | 'view_count' | 'shortlist_count'>): Promise<PinRequest> {
    return await PinRequestEntity.createRequest(data);
  }

  async updateRequest(id: number, data: Partial<Omit<PinRequest, 'id' | 'createdAt' | 'status'>>): Promise<PinRequest | null> {
    return await PinRequestEntity.updateRequest(id, data);
  }
  async deleteRequest(id: number): Promise<boolean> {
    return await PinRequestEntity.deleteRequest(id);
  }
  // Mark a PIN request and its assigned CSR request as Completed
  async markRequestCompleted(requestId: number): Promise<boolean> {
    return await PinRequestEntity.markRequestCompleted(requestId);
  }
}
