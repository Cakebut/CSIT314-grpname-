// Removed stray top-level async getAllPINRequests
import { CSRRepEntity } from '../entities/CSRRepEntity';

export class CSRRepControllers {
	async getAvailableRequests() {
		return await CSRRepEntity.getAvailableRequests();
	}

	async getShortlist(csrId: number) {
		return await CSRRepEntity.getShortlist(csrId);
	}

	// INTERESTED: Get all PIN requests this CSR is interested in
	async getInterested(csrId: number) {
		return await CSRRepEntity.getInterested(csrId);
	}

	async addToShortlist(csrId: number, requestId: number) {
		return await CSRRepEntity.addToShortlist(csrId, requestId);
	}

	// INTERESTED: Add a PIN request to CSR's interested list
	async addToInterested(csrId: number, requestId: number) {
		return await CSRRepEntity.addToInterested(csrId, requestId);
	}

	async removeFromShortlist(csrId: number, requestId: number) {
		return await CSRRepEntity.removeFromShortlist(csrId, requestId);
	}

	// INTERESTED: Remove a PIN request from CSR's interested list
	async removeFromInterested(csrId: number, requestId: number) {
		return await CSRRepEntity.removeFromInterested(csrId, requestId);
	}

	async getAllPINRequests() {
		return await CSRRepEntity.getAllPINRequests();
	}
}
