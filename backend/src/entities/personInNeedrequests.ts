import { db } from '../db/client';
import { and, eq, ilike, is, not } from 'drizzle-orm';
import { pin_requestsTable, useraccountTable, service_typeTable, locationTable, urgency_levelTable, csr_interestedTable } from '../db/schema/aiodb';





export interface PinRequest {
  id: number;
  pin_id: number;
  csr_id?: number | null;
  title: string;
  categoryID: number;
  message?: string | null;
  locationID?: number | null;
  urgencyLevelID?: number | null;
  createdAt: Date;
  status: string;
  view_count: number;
  shortlist_count: number;
}

export type PinRequestCreateInput = {
  pin_id: number;
  csr_id?: number | null;
  title: string;
  categoryID: number;
  message?: string | null;
  locationID?: number | null;
  urgencyLevelID?: number | null;
};




export class PinRequestEntity {
  // For My Offers: Get all requests for a PIN user, with interested CSRs for each
  static async getOffersByPinId(pin_id: number) {
    // Get all requests for this PIN
    const requests = await db
      .select({
        id: pin_requestsTable.id,
        title: pin_requestsTable.title,
        status: pin_requestsTable.status,
        csr_id: pin_requestsTable.csr_id,
      })
      .from(pin_requestsTable)
      .where(eq(pin_requestsTable.pin_id, pin_id));

    // For each request, get interested CSRs and feedback
    const offers = [];
    for (const req of requests) {
      const interested = await db
        .select({
          csr_id: csr_interestedTable.csr_id,
          interestedAt: csr_interestedTable.interestedAt,
          username: useraccountTable.username,
        })
        .from(csr_interestedTable)
        .leftJoin(useraccountTable, eq(csr_interestedTable.csr_id, useraccountTable.id))
        .where(eq(csr_interestedTable.pin_request_id, req.id));

      // Get feedback for this request (if any)
      const feedback = await db
        .select({
          id: require('../db/schema/aiodb').feedbackTable.id,
          rating: require('../db/schema/aiodb').feedbackTable.rating,
          description: require('../db/schema/aiodb').feedbackTable.description,
          createdAt: require('../db/schema/aiodb').feedbackTable.createdAt,
        })
        .from(require('../db/schema/aiodb').feedbackTable)
        .where(eq(require('../db/schema/aiodb').feedbackTable.requestId, req.id));

      offers.push({
        requestId: req.id,
        title: req.title,
        status: req.status,
        assignedCsrId: req.csr_id,
        interestedCsrs: interested,
        feedback: feedback.length > 0 ? feedback[0] : null,
      });
    }
    return offers;
  }

  // Accept a CSR for a request (assign and set status to pending)
  static async acceptCsrForRequest(requestId: number, csrId: number) {
    // 1. Assign CSR and set status to Pending
    const [updated] = await db
      .update(pin_requestsTable)
      .set({ csr_id: csrId, status: 'Pending' })
      .where(eq(pin_requestsTable.id, requestId))
      .returning();

    // 2. Update csr_requestsTable: accepted CSR gets 'Accepted', all others get 'Rejected'
    const { and, not } = require('drizzle-orm');
    // Accept the chosen CSR
    await db.update(require('../db/schema/aiodb').csr_requestsTable)
      .set({ status: 'Accepted' })
      .where(and(
        eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId),
        eq(require('../db/schema/aiodb').csr_requestsTable.pin_request_id, requestId)
      ));

    // Send notification to accepted CSR
    await db.insert(require('../db/schema/aiodb').notificationTable).values({
      pin_id: updated.pin_id,
      csr_id: csrId,
      pin_request_id: requestId,
      type: 'accepted',
      createdAt: new Date(),
      read: 0,
    });

    // Find all other interested/rejected CSRs for this request
    const rejectedCsrs = await db
      .select({ csr_id: require('../db/schema/aiodb').csr_requestsTable.csr_id })
      .from(require('../db/schema/aiodb').csr_requestsTable)
      .where(and(
        not(eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId)),
        eq(require('../db/schema/aiodb').csr_requestsTable.pin_request_id, requestId)
      ));

    // Reject all other interested CSRs for this request
    await db.update(require('../db/schema/aiodb').csr_requestsTable)
      .set({ status: 'Rejected' })
      .where(and(
        not(eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId)),
        eq(require('../db/schema/aiodb').csr_requestsTable.pin_request_id, requestId)
      ));

    // Send notification to each rejected CSR
    for (const r of rejectedCsrs) {
      await db.insert(require('../db/schema/aiodb').notificationTable).values({
        pin_id: updated.pin_id,
        csr_id: r.csr_id,
        pin_request_id: requestId,
        type: 'rejected',
        createdAt: new Date(),
        read: 0,
      });
    }

    // Delete all other CSR entries for this request from csr_interestedTable
    await db.delete(require('../db/schema/aiodb').csr_interestedTable)
      .where(and(
        eq(require('../db/schema/aiodb').csr_interestedTable.pin_request_id, requestId),
        not(eq(require('../db/schema/aiodb').csr_interestedTable.csr_id, csrId))
      ));

    return updated;
  }

  // Cancel a CSR's interest for a request
  static async cancelCsrInterest(requestId: number, csrId: number) {
    // Delete from csr_interestedTable
    await db.delete(require('../db/schema/aiodb').csr_interestedTable)
      .where(and(
        eq(require('../db/schema/aiodb').csr_interestedTable.pin_request_id, requestId),
        eq(require('../db/schema/aiodb').csr_interestedTable.csr_id, csrId)
      ));
    // Update status in csr_requestsTable
    await db.update(require('../db/schema/aiodb').csr_requestsTable)
      .set({ status: 'Rejected' })
      .where(and(
        eq(require('../db/schema/aiodb').csr_requestsTable.pin_request_id, requestId),
        eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId)
      ));

    // Get pin_id for notification
    const pinReq = await db.select({ pin_id: pin_requestsTable.pin_id })
      .from(pin_requestsTable)
      .where(eq(pin_requestsTable.id, requestId));
    const pin_id = pinReq[0]?.pin_id;
    if (pin_id) {
      await db.insert(require('../db/schema/aiodb').notificationTable).values({
        pin_id,
        csr_id: csrId,
        pin_request_id: requestId,
        type: 'rejected',
        createdAt: new Date(),
        read: 0,
      });
    }
    return true;
  }
  static async getAllRequests(): Promise<any[]> {
    // Join pin_requests with users to get username as pinName
    return await db
      .select({
        id: pin_requestsTable.id,
        pin_id: pin_requestsTable.pin_id,
        pinName: useraccountTable.username,
        title: pin_requestsTable.title,
        csr_id: pin_requestsTable.csr_id,
        categoryID: pin_requestsTable.categoryID,
        categoryName: service_typeTable.name,
        message: pin_requestsTable.message,
        locationID: pin_requestsTable.locationID,
        locationName: locationTable.name,
        urgencyLevelID: pin_requestsTable.urgencyLevelID,
        urgencyLabel: urgency_levelTable.label,
    
        createdAt: pin_requestsTable.createdAt,
        status: pin_requestsTable.status,
      })
      .from(pin_requestsTable)
      .leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id))
      .leftJoin(service_typeTable, eq(pin_requestsTable.categoryID, service_typeTable.id))
      .leftJoin(locationTable, eq(pin_requestsTable.locationID, locationTable.id))
      .leftJoin(urgency_levelTable, eq(pin_requestsTable.urgencyLevelID, urgency_levelTable.id));
  }

  static async getRequestsByPinId(pin_id: number): Promise<any[]> {
    // Join pin_requests with users to get username as pinName for a specific pin_id
    return await db
      .select({
        id: pin_requestsTable.id,
        pin_id: pin_requestsTable.pin_id,
        pinName: useraccountTable.username,
        title: pin_requestsTable.title,
        csr_id: pin_requestsTable.csr_id,
        categoryID: pin_requestsTable.categoryID,
        categoryName: service_typeTable.name,
        message: pin_requestsTable.message,
        locationID: pin_requestsTable.locationID,
        locationName: locationTable.name,
        urgencyLevelID: pin_requestsTable.urgencyLevelID,
        urgencyLabel: urgency_levelTable.label,
        view_count: pin_requestsTable.view_count,
        shortlist_count: pin_requestsTable.shortlist_count,
        createdAt: pin_requestsTable.createdAt,
        status: pin_requestsTable.status,
      })
      .from(pin_requestsTable)
      .leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id))
      .leftJoin(service_typeTable, eq(pin_requestsTable.categoryID, service_typeTable.id))
      .leftJoin(locationTable, eq(pin_requestsTable.locationID, locationTable.id))
      .leftJoin(urgency_levelTable, eq(pin_requestsTable.urgencyLevelID, urgency_levelTable.id))
    .where(eq(pin_requestsTable.pin_id, pin_id));
  }

  static async createRequest(data: PinRequestCreateInput): Promise<PinRequest> {
    // Lookup the service type name for requestType
    const serviceType = await db.select().from(service_typeTable).where(eq(service_typeTable.id, data.categoryID)).then(rows => rows[0]);
    const requestType = serviceType ? serviceType.name : 'Unknown';
    const insertData = {
      ...data,
      requestType,
      view_count: 0,
      shortlist_count: 0
    } as any;
    const [created] = await db
      .insert(pin_requestsTable)
      .values({ ...insertData, status: 'Available' })
      .returning();
    return created;
  }

  static async incrementViewCount(requestId: number): Promise<void> {
    await db.execute(
      `UPDATE pin_requests SET view_count = view_count + 1 WHERE id = ${requestId}`
    );
  }

  static async incrementShortlistCount(requestId: number): Promise<void> {
    await db.execute(
      `UPDATE pin_requests SET shortlist_count = shortlist_count + 1 WHERE id = ${requestId}`
    );
  }

  static async updateRequest(id: number, data: Partial<Omit<PinRequest, 'id' | 'createdAt' | 'status'>>): Promise<PinRequest | null> {
    // If categoryID is being updated, lookup the new requestType
    let requestType: string | undefined = undefined;
    if (data.categoryID) {
      const serviceType = await db.select().from(service_typeTable).where(eq(service_typeTable.id, data.categoryID)).then(rows => rows[0]);
      requestType = serviceType ? serviceType.name : 'Unknown';
    }
    const updateData = { ...data } as any;
    if (requestType) updateData.requestType = requestType;
    const [updated] = await db
      .update(pin_requestsTable)
      .set(updateData)
      .where(eq(pin_requestsTable.id, id))
      .returning();
    return updated || null;
  }
  static async deleteRequest(id: number): Promise<boolean> {
    const result = await db.delete(pin_requestsTable).where(eq(pin_requestsTable.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  /**
   * Returns all requests for a specific PIN user as CSV string for download.
   */
  static async getRequestsHistoryCSVByPinId(pin_id: number): Promise<string> {
    // Get all requests for this PIN user with joined info
    const requests = await db
      .select({
        id: pin_requestsTable.id,
        pin_id: pin_requestsTable.pin_id,
        pinName: useraccountTable.username,
        title: pin_requestsTable.title,
        csr_id: pin_requestsTable.csr_id,
        categoryID: pin_requestsTable.categoryID,
        categoryName: service_typeTable.name,
        message: pin_requestsTable.message,
        locationID: pin_requestsTable.locationID,
        locationName: locationTable.name,
        urgencyLevelID: pin_requestsTable.urgencyLevelID,
        urgencyLabel: urgency_levelTable.label,
        view_count: pin_requestsTable.view_count,
        shortlist_count: pin_requestsTable.shortlist_count,
        createdAt: pin_requestsTable.createdAt,
        status: pin_requestsTable.status,
      })
      .from(pin_requestsTable)
      .leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id))
      .leftJoin(service_typeTable, eq(pin_requestsTable.categoryID, service_typeTable.id))
      .leftJoin(locationTable, eq(pin_requestsTable.locationID, locationTable.id))
      .leftJoin(urgency_levelTable, eq(pin_requestsTable.urgencyLevelID, urgency_levelTable.id))
      .where(eq(pin_requestsTable.pin_id, pin_id));

    // Convert to CSV with formatted date, custom id, and filtered columns
    if (!requests.length) return '';
    // Columns to include (exclude categoryID, locationID, urgencyLevelID)
    const includeHeaders = Object.keys(requests[0]).filter(
      h => !['categoryID', 'locationID', 'urgencyLevelID', 'id'].includes(h)
    );
    // Insert our own 'id' as the first column
    const headers = ['id', ...includeHeaders];
    const csvRows = [headers.join(',')];
    requests.forEach((row, idx) => {
      const values = headers.map(h => {
        if (h === 'id') return (idx + 1).toString();
        let val = row[h as keyof typeof row];
        if (h === 'createdAt' && val) {
          try {
            val = new Date(val).toISOString().slice(0, 10);
          } catch {}
        }
        if (h === 'csr_id' && (val === undefined || val === null || val === '')) {
          return 'NULL';
        }
        if (val === null || val === undefined) return '';
        return '"' + String(val).replace(/"/g, '""') + '"';
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  }

  // Mark a PIN request and its assigned CSR request as Completed
  static async markRequestCompleted(requestId: number): Promise<boolean> {
    // 1. Update PIN request status to Completed
    const [updatedPin] = await db
      .update(pin_requestsTable)
      .set({ status: 'Completed' })
      .where(eq(pin_requestsTable.id, requestId))
      .returning();
    if (!updatedPin) return false;
    // 2. Find assigned CSR for this request
    const csrId = updatedPin.csr_id;
    if (csrId) {
      // 3. Update CSR request status to Completed
      await db.update(require('../db/schema/aiodb').csr_requestsTable)
        .set({ status: 'Completed' })
        .where(and(
          eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId),
          eq(require('../db/schema/aiodb').csr_requestsTable.pin_request_id, requestId)
        ));
    }
    return true;
  }
}