import { db } from '../db/client';
import { pin_requestsTable, service_typeTable, locationTable, urgency_levelTable, csr_shortlistTable, csr_interestedTable, useraccountTable, feedbackTable, csr_requestsTable } from '../db/schema/aiodb';
import { eq, and } from 'drizzle-orm';

export class CSRRepEntity {
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
						// Get all interested pin_request_ids for this CSR
						const interestedRows = await db
							.select({ pin_request_id: csr_interestedTable.pin_request_id, interestedAt: csr_interestedTable.interestedAt })
							.from(csr_interestedTable)
							.where(eq(csr_interestedTable.csr_id, csrId));

						const pinRequestIds = interestedRows.map(row => row.pin_request_id);
						if (pinRequestIds.length === 0) return [];

						const { inArray } = require('drizzle-orm');
						// Join pin_requestsTable with csr_requestsTable and useraccountTable to get CSR-specific status
						const rows = await db
							.select({
								requestId: pin_requestsTable.id,
								title: pin_requestsTable.title,
								categoryID: pin_requestsTable.categoryID,
								locationID: pin_requestsTable.locationID,
								urgencyLevelID: pin_requestsTable.urgencyLevelID,
								status: csr_requestsTable.status, // Use CSR-specific status
								pinId: pin_requestsTable.pin_id,
								pinUsername: useraccountTable.username,
								createdAt: pin_requestsTable.createdAt,
								message: pin_requestsTable.message,
							})
							.from(pin_requestsTable)
							.innerJoin(csr_requestsTable, and(
								eq(csr_requestsTable.csr_id, csrId),
								eq(csr_requestsTable.pin_id, pin_requestsTable.pin_id),
								eq(csr_requestsTable.categoryID, pin_requestsTable.categoryID)
							))
							.leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id))
							.where(inArray(pin_requestsTable.id, pinRequestIds));

						// Fetch feedback for these requests and this CSR
						const feedbacks = await db.select().from(feedbackTable)
							.where(inArray(feedbackTable.request_id, pinRequestIds));
						// Map feedback by requestId and pinId
						const feedbackMap: Record<string, any> = {};
						for (const fb of feedbacks) {
							feedbackMap[`${fb.request_id}_${fb.csr_id}_${fb.pin_id}`] = fb;
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

						// Map interestedAt from join table
						const interestedAtMap = Object.fromEntries(interestedRows.map(r => [r.pin_request_id, r.interestedAt]));

						return rows.map(r => {
							const feedback = feedbackMap[`${r.requestId}_${csrId}_${r.pinId}`];
							return {
								requestId: r.requestId,
								title: r.title,
								categoryName: serviceTypes[r.categoryID] || '',
								location: r.locationID ? (locations[r.locationID] || '') : '',
								urgencyLevel: r.urgencyLevelID ? (urgencies[r.urgencyLevelID] || null) : null,
								status: r.status,
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
		// Insert interest
		const result = await db.insert(csr_interestedTable).values({ csr_id: csrId, pin_request_id: requestId }).execute();
		// Get pin_request details
		const pinReq = await db.select({
			pin_id: pin_requestsTable.pin_id,
			categoryID: pin_requestsTable.categoryID,
			message: pin_requestsTable.message
		}).from(pin_requestsTable).where(eq(pin_requestsTable.id, requestId)).limit(1);
		if (pinReq && pinReq[0]) {
			// Check if csr_requests already exists for this csr/request (use csr_id and requestId for uniqueness)
			const { and, eq } = require('drizzle-orm');
			const existingReq = await db.select().from(require('../db/schema/aiodb').csr_requestsTable)
				.where(and(
					eq(require('../db/schema/aiodb').csr_requestsTable.csr_id, csrId),
					eq(require('../db/schema/aiodb').csr_requestsTable.id, requestId)
				));
			if (!existingReq || existingReq.length === 0) {
				await db.insert(require('../db/schema/aiodb').csr_requestsTable).values({
					id: requestId,
					pin_id: pinReq[0].pin_id,
					csr_id: csrId,
					categoryID: pinReq[0].categoryID,
					message: pinReq[0].message,
					status: 'Pending'
				}).execute();
			}
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
		// Delete from csr_interestedTable
		await db.delete(csr_interestedTable)
			.where(and(
				eq(csr_interestedTable.csr_id, csrId),
				eq(csr_interestedTable.pin_request_id, requestId)
			));
		// Delete from csr_requestsTable using serial id
		await db.delete(csr_requestsTable)
			.where(eq(csr_requestsTable.id, requestId));
		return { removed: true };
	}
}
