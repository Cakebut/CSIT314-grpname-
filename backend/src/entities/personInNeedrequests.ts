
import { db } from '../index';
import { and, eq, ilike, is } from 'drizzle-orm';
import { pin_requestsTable, useraccountTable, service_typeTable, locationTable, urgency_levelTable } from '../db/schema/aiodb';





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
   * Returns all requests as CSV string for download.
   */
  static async getRequestsHistoryCSV(): Promise<string> {
    // Get all requests with joined info
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
      .leftJoin(urgency_levelTable, eq(pin_requestsTable.urgencyLevelID, urgency_levelTable.id));

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
}