
import { PinRequestEntity, PinRequest } from '../entities/personInNeedrequests';

export class PersonInNeedControllers {
  // Download CSV history for a PIN user (BCE: controller -> entity)
  async getRequestsHistoryCSV(): Promise<string> {
    return await PinRequestEntity.getRequestsHistoryCSV();
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
}
