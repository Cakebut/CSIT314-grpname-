import { db } from '../db/client';
import { pin_requestsTable, service_typeTable, locationTable, urgency_levelTable, csr_shortlistTable, csr_interestedTable, useraccountTable, feedbackTable, csr_requestsTable } from '../db/schema/aiodb';
import { eq, and } from 'drizzle-orm';

export class CSRRepEntity {
	// Get CSR history: all requests assigned to this CSR, with service type and location names, and filter by type
	static async getCSRHistory(csrId: number, type?: string) {
		// Get all requests assigned to this CSR
		let query = db
			.select({
				requestId: pin_requestsTable.id,
				title: pin_requestsTable.title,
				categoryID: pin_requestsTable.categoryID,
				locationID: pin_requestsTable.locationID,
				status: pin_requestsTable.status,
				createdAt: pin_requestsTable.createdAt,
			})
			.from(pin_requestsTable)
			.where(eq(pin_requestsTable.csr_id, csrId));

		// If type is specified and not "All Types", filter by service_type name
		if (type && type !== "All Types") {
			// Get service_type id for the given name
			const typeRow = await db.select().from(service_typeTable).where(eq(service_typeTable.name, type)).limit(1);
			if (typeRow && typeRow[0] && typeRow[0].id) {
				query = db
					.select({
						requestId: pin_requestsTable.id,
						title: pin_requestsTable.title,
						categoryID: pin_requestsTable.categoryID,
						locationID: pin_requestsTable.locationID,
						status: pin_requestsTable.status,
						createdAt: pin_requestsTable.createdAt,
					})
					.from(pin_requestsTable)
					.where(and(eq(pin_requestsTable.csr_id, csrId), eq(pin_requestsTable.categoryID, typeRow[0].id)));
			}
		}

		const rows = await query;
		const serviceTypes = Object.fromEntries(
			(await db.select().from(service_typeTable)).map(st => [st.id, st.name])
		);
		const locations = Object.fromEntries(
			(await db.select().from(locationTable)).map(l => [l.id, l.name])
		);

		return rows.map(r => ({
			requestId: r.requestId,
			name: r.title,
			date: r.createdAt ? r.createdAt.toISOString().slice(0, 10) : '',
			location: r.locationID ? (locations[r.locationID] || '') : '',
			type: serviceTypes[r.categoryID] || '',
			status: r.status,
		}));
	}
	// ...existing code...

// ...existing code...
		// Get all PIN requests (regardless of status/assignment), with joined labels
		static async getAllPINRequests() {
			const rows = await db
				   .select({
					   requestId: pin_requestsTable.id,
					   title: pin_requestsTable.title,
					   categoryID: pin_requestsTable.categoryID,
					   locationID: pin_requestsTable.locationID,
					   urgencyLevelID: pin_requestsTable.urgencyLevelID,
					   status: pin_requestsTable.status,
					   message: pin_requestsTable.message,
					   pinName: useraccountTable.username,
				   })
				.from(pin_requestsTable)
				.leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id));

			const serviceTypes = Object.fromEntries(
				(await db.select().from(service_typeTable)).map(st => [st.id, st.name])
			);
			const locations = Object.fromEntries(
				(await db.select().from(locationTable)).map(l => [l.id, l.name])
			);
			const urgencies = Object.fromEntries(
				(await db.select().from(urgency_levelTable)).map(u => [u.id, u.label])
			);

			return rows.map(r => ({
				   requestId: r.requestId,
				   title: r.title,
				   categoryName: serviceTypes[r.categoryID] || '',
				   location: r.locationID ? (locations[r.locationID] || '') : '',
				   urgencyLevel: r.urgencyLevelID ? (urgencies[r.urgencyLevelID] || null) : null,
				   status: r.status,
				   message: r.message,
				   pinName: r.pinName || null,
			}));
		}

		// Get all available requests (not assigned to a CSR, status Available), with joined labels
		static async getAvailableRequests() {
			const rows = await db
				   .select({
					   requestId: pin_requestsTable.id,
					   title: pin_requestsTable.title,
					   categoryID: pin_requestsTable.categoryID,
					   locationID: pin_requestsTable.locationID,
					   urgencyLevelID: pin_requestsTable.urgencyLevelID,
					   status: pin_requestsTable.status,
					   message: pin_requestsTable.message,
					   pinName: useraccountTable.username,
				   })
				.from(pin_requestsTable)
				.where(eq(pin_requestsTable.status, 'Available'))
				.leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id));

			// Join to get category, location, urgency labels
			const serviceTypes = Object.fromEntries(
				(await db.select().from(service_typeTable)).map(st => [st.id, st.name])
			);
			const locations = Object.fromEntries(
				(await db.select().from(locationTable)).map(l => [l.id, l.name])
			);
			const urgencies = Object.fromEntries(
				(await db.select().from(urgency_levelTable)).map(u => [u.id, u.label])
			);

			return rows.map(r => ({
				requestId: r.requestId,
				title: r.title,
				categoryName: serviceTypes[r.categoryID] || '',
				location: r.locationID ? (locations[r.locationID] || '') : '',
				urgencyLevel: r.urgencyLevelID ? (urgencies[r.urgencyLevelID] || null) : null,
				status: r.status,
				message: r.message,
				pinName: r.pinName || null,
			}));
		}


		// Get shortlist for a CSR, with joined labels (many-to-many via csr_shortlistTable)
		static async getShortlist(csrId: number) {
			// Get all pin_request_ids shortlisted by this CSR

			const shortlistRows = await db
				.select({ pin_request_id: csr_shortlistTable.pin_request_id })
				.from(csr_shortlistTable)
				.where(eq(csr_shortlistTable.csr_id, csrId));

			const pinRequestIds = shortlistRows.map(row => row.pin_request_id);
			if (pinRequestIds.length === 0) return [];

			// Fetch the actual requests with PIN name
			const { inArray } = require('drizzle-orm');
			const rows = await db
				.select({
					requestId: pin_requestsTable.id,
					title: pin_requestsTable.title,
					categoryID: pin_requestsTable.categoryID,
					locationID: pin_requestsTable.locationID,
					urgencyLevelID: pin_requestsTable.urgencyLevelID,
					status: pin_requestsTable.status,
					message: pin_requestsTable.message,
					pinName: useraccountTable.username,
				})
				.from(pin_requestsTable)
				.where(inArray(pin_requestsTable.id, pinRequestIds))
				.leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id));

			const serviceTypes = Object.fromEntries(
				(await db.select().from(service_typeTable)).map(st => [st.id, st.name])
			);
			const locations = Object.fromEntries(
				(await db.select().from(locationTable)).map(l => [l.id, l.name])
			);
			const urgencies = Object.fromEntries(
				(await db.select().from(urgency_levelTable)).map(u => [u.id, u.label])
			);

			return rows.map(r => ({
				requestId: r.requestId,
				title: r.title,
				categoryName: serviceTypes[r.categoryID] || '',
				location: r.locationID ? (locations[r.locationID] || '') : '',
				urgencyLevel: r.urgencyLevelID ? (urgencies[r.urgencyLevelID] || null) : null,
				status: r.status,
				pinName: r.pinName || null,
				message: r.message,
			}));
		}

				static async getInterested(csrId: number) {
					try {
						// Query csr_requestsTable directly for all offers for this CSR
						const csrRows = await db
							.select({
								pin_request_id: csr_requestsTable.pin_request_id,
								status: csr_requestsTable.status,
								interestedAt: csr_requestsTable.interestedAt
							})
							.from(csr_requestsTable)
							.where(eq(csr_requestsTable.csr_id, csrId));

						const pinRequestIds = csrRows.map(row => row.pin_request_id);
						if (pinRequestIds.length === 0) return [];

						const { inArray } = require('drizzle-orm');
						// Join pin_requestsTable with useraccountTable to get request details
						const rows = await db
							.select({
								requestId: pin_requestsTable.id,
								title: pin_requestsTable.title,
								categoryID: pin_requestsTable.categoryID,
								locationID: pin_requestsTable.locationID,
								urgencyLevelID: pin_requestsTable.urgencyLevelID,
								pinId: pin_requestsTable.pin_id,
								pinUsername: useraccountTable.username,
								createdAt: pin_requestsTable.createdAt,
								message: pin_requestsTable.message,
							})
							.from(pin_requestsTable)
							.leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id))
							.where(inArray(pin_requestsTable.id, pinRequestIds));

						// Fetch feedback for these requests and this CSR
						const feedbacks = await db.select().from(feedbackTable)
							.where(inArray(feedbackTable.requestId, pinRequestIds));
						// Map feedback by requestId and pinId
						const feedbackMap: Record<string, any> = {};
						for (const fb of feedbacks) {
							feedbackMap[`${fb.requestId}_${csrId}_${fb.pin_id}`] = fb;
						}

						const serviceTypes = Object.fromEntries(
							(await db.select().from(service_typeTable)).map(st => [st.id, st.name])
						);
						const locations = Object.fromEntries(
							(await db.select().from(locationTable)).map(l => [l.id, l.name])
						);
						const urgencies = Object.fromEntries(
							(await db.select().from(urgency_levelTable)).map(u => [u.id, u.label])
						);

						// Map interestedAt and status from csr_requestsTable
						const interestedAtMap = Object.fromEntries(csrRows.map(r => [r.pin_request_id, r.interestedAt]));
						const statusMap = Object.fromEntries(csrRows.map(r => [r.pin_request_id, r.status]));

						return rows.map(r => {
							const feedback = feedbackMap[`${r.requestId}_${csrId}_${r.pinId}`];
							return {
								requestId: r.requestId,
								title: r.title,
								categoryName: serviceTypes[r.categoryID] || '',
								location: r.locationID ? (locations[r.locationID] || '') : '',
								urgencyLevel: r.urgencyLevelID ? (urgencies[r.urgencyLevelID] || null) : null,
								status: statusMap[r.requestId] || null,
								pinId: r.pinId,
								pinUsername: r.pinUsername,
								createdAt: r.createdAt,
								message: r.message,
								interestedAt: interestedAtMap[r.requestId] || null,
								feedbackRating: feedback ? feedback.rating : null,
								feedbackDescription: feedback ? feedback.description : null,
								feedbackCreatedAt: feedback ? feedback.createdAt : null,
							};
						});
					} catch (err) {
						console.error('Error in getInterested:', err);
						return [];
					}
				}

	// Add to shortlist (many-to-many: insert into csr_shortlistTable)

	static async addToShortlist(csrId: number, requestId: number) {
		// Insert ignore duplicate
		const result = await db.insert(csr_shortlistTable).values({ csr_id: csrId, pin_request_id: requestId }).execute();
		// Get pin_id for the request
		const req = await db.select({ pin_id: pin_requestsTable.pin_id }).from(pin_requestsTable).where(eq(pin_requestsTable.id, requestId)).limit(1);
		if (req && req[0] && req[0].pin_id) {
			await db.insert(require('../db/schema/aiodb').notificationTable).values({
				pin_id: req[0].pin_id,
				type: 'shortlist',
				csr_id: csrId,
				pin_request_id: requestId,
			}).execute();
		}
		return result;
	}

	// INTERESTED: Add to interested (same as shortlist logic)

	static async addToInterested(csrId: number, requestId: number) {
		// Check if already interested
		const existing = await db.select().from(csr_interestedTable)
			.where(
				require('drizzle-orm').and(
					require('drizzle-orm').eq(csr_interestedTable.csr_id, csrId),
					require('drizzle-orm').eq(csr_interestedTable.pin_request_id, requestId)
				)
			);
		if (existing && existing.length > 0) {
			// Already interested, return success
			return { alreadyInterested: true };
		}
	// Insert interest and get interestedAt timestamp
	const now = new Date();
	const result = await db.insert(csr_interestedTable).values({ csr_id: csrId, pin_request_id: requestId, interestedAt: now }).execute();
		// Get pin_request details
		const { and, eq } = require('drizzle-orm');
		const pinReq = await db.select({
			id: pin_requestsTable.id,
			message: pin_requestsTable.message
		}).from(pin_requestsTable).where(eq(pin_requestsTable.id, requestId)).limit(1);
		if (!pinReq || !pinReq[0] || pinReq[0].id === undefined) {
			console.error('[addToInterested] Failed to find pin_request_id for requestId', requestId, pinReq);
			return { error: 'Failed to find pin_request_id for requestId ' + requestId };
		}
		// Check if csr_requests already exists for this csr/request (use csr_id, pin_request_id for uniqueness)
		const existingReq = await db.select().from(require('../db/schema/aiodb').csr_requestsTable)
			.where(and(
				eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId),
				eq(require('../db/schema/aiodb').csr_requestsTable.pin_request_id, pinReq[0].id)
			));
		if (!existingReq || existingReq.length === 0) {
			await db.insert(require('../db/schema/aiodb').csr_requestsTable).values({
				pin_request_id: pinReq[0].id,
				csr_id: csrId,
				message: pinReq[0].message,
				status: 'Pending',
				interestedAt: now
			}).execute();
		}
		// Notification logic unchanged
		const req = await db.select({ pin_id: pin_requestsTable.pin_id }).from(pin_requestsTable).where(eq(pin_requestsTable.id, requestId)).limit(1);
		if (req && req[0] && req[0].pin_id) {
			await db.insert(require('../db/schema/aiodb').notificationTable).values({
				pin_id: req[0].pin_id,
				type: 'interested',
				csr_id: csrId,
				pin_request_id: requestId,
			}).execute();
		}
		return result;
	}

	// Remove from shortlist (many-to-many: delete from csr_shortlistTable)
	static async removeFromShortlist(csrId: number, requestId: number) {
		const { and } = require('drizzle-orm');
		return db.delete(csr_shortlistTable)
			.where(
				and(
					eq(csr_shortlistTable.csr_id, csrId),
					eq(csr_shortlistTable.pin_request_id, requestId)
				)
			).execute();
	}

	// INTERESTED: Remove from interested and also delete from csr_requestsTable
	static async removeFromInterested(csrId: number, requestId: number) {
		// Delete the records from both csr_requestsTable and csr_interestedTable
		// to reflect that the CSR has unmarked interest (no history kept in active lists).
		const { and, eq } = require('drizzle-orm');
		// Delete csr_requests entry for this csr/request
		await db.delete(csr_requestsTable)
			.where(and(
				eq(csr_requestsTable.csr_id, csrId),
				eq(csr_requestsTable.pin_request_id, requestId)
			));
		// Delete csr_interested entry for this csr/request
		await db.delete(csr_interestedTable)
			.where(and(
				eq(csr_interestedTable.csr_id, csrId),
				eq(csr_interestedTable.pin_request_id, requestId)
			));
		return { removed: true };
	}
}
