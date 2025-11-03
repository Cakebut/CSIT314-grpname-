	import { db } from '../index';
	import { pin_requestsTable, service_typeTable, locationTable, urgency_levelTable, csr_shortlistTable, csr_interestedTable, useraccountTable, feedbackTable } from '../db/schema/aiodb';
	import { eq } from 'drizzle-orm';

	export class CSRRepEntity {
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
						// Join pin_requestsTable with useraccountTable to get PIN username
						const rows = await db
							.select({
								requestId: pin_requestsTable.id,
								title: pin_requestsTable.title,
								categoryID: pin_requestsTable.categoryID,
								locationID: pin_requestsTable.locationID,
								urgencyLevelID: pin_requestsTable.urgencyLevelID,
								status: pin_requestsTable.status,
								pinId: pin_requestsTable.pin_id,
								pinUsername: useraccountTable.username,
								createdAt: pin_requestsTable.createdAt,
								message: pin_requestsTable.message,
							})
							.from(pin_requestsTable)
							.where(inArray(pin_requestsTable.id, pinRequestIds))
							.leftJoin(useraccountTable, eq(pin_requestsTable.pin_id, useraccountTable.id));

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
		try {
			const result = await db.insert(csr_interestedTable).values({ csr_id: csrId, pin_request_id: requestId }).execute();
			// Get pin_id for the request
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
		} catch (err) {
			// Unique constraint violation (already interested) -- ignore or return a friendly message
			const e = err as any;
			if (e && e.code && (e.code === '23505' || e.message?.includes('duplicate key'))) {
				return { alreadyInterested: true };
			}
			// Other errors, rethrow
			throw err;
		}
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

	// INTERESTED: Remove from interested (same as shortlist logic)
	static async removeFromInterested(csrId: number, requestId: number) {
		const { and } = require('drizzle-orm');
		return db.delete(csr_interestedTable)
			.where(
				and(
					eq(csr_interestedTable.csr_id, csrId),
					eq(csr_interestedTable.pin_request_id, requestId)
				)
			).execute();
	}
}
