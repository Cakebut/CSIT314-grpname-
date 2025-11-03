	import { db } from '../index';
	import { pin_requestsTable, service_typeTable, locationTable, urgency_levelTable, csr_shortlistTable, csr_interestedTable, useraccountTable } from '../db/schema/aiodb';
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
				})
				.from(pin_requestsTable);

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
				})
				.from(pin_requestsTable)
				.where(eq(pin_requestsTable.status, 'Available'));

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

			// Fetch the actual requests
			// Use inArray for Drizzle ORM
			const { inArray } = require('drizzle-orm');
			const rows = await db
				.select({
					requestId: pin_requestsTable.id,
					title: pin_requestsTable.title,
					categoryID: pin_requestsTable.categoryID,
					locationID: pin_requestsTable.locationID,
					urgencyLevelID: pin_requestsTable.urgencyLevelID,
					status: pin_requestsTable.status,
				})
				.from(pin_requestsTable)
				.where(inArray(pin_requestsTable.id, pinRequestIds));

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
			}));
		}

		static async getInterested(csrId: number) {
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

			// Map interestedAt from join table
			const interestedAtMap = Object.fromEntries(interestedRows.map(r => [r.pin_request_id, r.interestedAt]));

			return rows.map(r => ({
				requestId: r.requestId,
				title: r.title,
				categoryName: serviceTypes[r.categoryID] || '',
				location: r.locationID ? (locations[r.locationID] || '') : '',
				urgencyLevel: r.urgencyLevelID ? (urgencies[r.urgencyLevelID] || null) : null,
				status: r.status,
				pinId: r.pinId,
				pinUsername: r.pinUsername,
				createdAt: r.createdAt,
				interestedAt: interestedAtMap[r.requestId] || null,
			}));
		}

	// Add to shortlist (many-to-many: insert into csr_shortlistTable)
	static async addToShortlist(csrId: number, requestId: number) {
		// Insert ignore duplicate
		return db.insert(csr_shortlistTable).values({ csr_id: csrId, pin_request_id: requestId }).execute();
	}

	// INTERESTED: Add to interested (same as shortlist logic)
	static async addToInterested(csrId: number, requestId: number) {
		return db.insert(csr_interestedTable).values({ csr_id: csrId, pin_request_id: requestId }).execute();
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
