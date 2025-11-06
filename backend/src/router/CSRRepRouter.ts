
import express from 'express';
import { CSRRepControllers } from '../controller/CSRRepControllers';

const router = express.Router();
const controller = new CSRRepControllers();

// GET /api/csr/pin_requests
router.get('/pin_requests', async (req, res) => {
	try {
		const requests = await controller.getAllPINRequests();
		res.json({ requests });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch all PIN requests' });
	}
});

// GET /api/csr/requests/open
router.get('/requests/open', async (req, res) => {
	try {
		const requests = await controller.getAvailableRequests();
		res.json({ requests });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch available requests' });
	}
});

// GET /api/csr/:csrId/shortlist
router.get('/:csrId/shortlist', async (req, res) => {
	try {
		const csrId = Number(req.params.csrId);
		const shortlistedRequests = await controller.getShortlist(csrId);
		res.json({ shortlistedRequests });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch shortlist' });
	}
});

// INTERESTED: GET /api/csr/:csrId/interested
router.get('/:csrId/interested', async (req, res) => {
	try {
		const csrId = Number(req.params.csrId);
		const interestedRequests = await controller.getInterested(csrId);
		res.json({ interestedRequests });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch interested list' });
	}
});

// OFFERS: GET /api/csr/:csrId/offers
router.get('/:csrId/offers', async (req, res) => {
	try {
		const csrId = Number(req.params.csrId);
		const offers = await controller.getInterested(csrId);
		res.json({ offers });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch offers' });
	}
});

// POST /api/csr/:csrId/shortlist/:requestId
router.post('/:csrId/shortlist/:requestId', async (req, res) => {
       try {
	       const csrId = Number(req.params.csrId);
	       const requestId = Number(req.params.requestId);
	       await controller.addToShortlist(csrId, requestId);
	       res.json({ success: true });
       } catch (err) {
			   const errorMsg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
			   console.error('Failed to add to shortlist:', errorMsg);
			   res.status(500).json({ error: 'Failed to add to shortlist', details: errorMsg });
       }
});

// INTERESTED: POST /api/csr/:csrId/interested/:requestId
router.post('/:csrId/interested/:requestId', async (req, res) => {
	   try {
		   const csrId = Number(req.params.csrId);
		   const requestId = Number(req.params.requestId);
		   const result = await controller.addToInterested(csrId, requestId);
		   if (result && typeof result === 'object' && 'alreadyInterested' in result && (result as any).alreadyInterested) {
			   return res.status(200).json({ alreadyInterested: true });
		   }
		   return res.json({ success: true });
	   } catch (err) {
		   // Check for unique constraint violation in error message/code
		   const e = err as any;
		   if (e && (e.code === '23505' || e.message?.includes('duplicate key'))) {
			   return res.status(200).json({ alreadyInterested: true });
		   }
		   const errorMsg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : String(err);
		   console.error('Failed to add to interested:', errorMsg);
		   return res.status(500).json({ error: 'Failed to add to interested', details: errorMsg });
	   }
});

// DELETE /api/csr/:csrId/shortlist/:requestId
router.delete('/:csrId/shortlist/:requestId', async (req, res) => {
	try {
		const csrId = Number(req.params.csrId);
		const requestId = Number(req.params.requestId);
		await controller.removeFromShortlist(csrId, requestId);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: 'Failed to remove from shortlist' });
	}
});

// INTERESTED: DELETE /api/csr/:csrId/interested/:requestId
router.delete('/:csrId/interested/:requestId', async (req, res) => {
	try {
		const csrId = Number(req.params.csrId);
		const requestId = Number(req.params.requestId);
		await controller.removeFromInterested(csrId, requestId);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: 'Failed to remove from interested' });
	}
});

// GET /api/csr/:csrId/history?type=ServiceTypeName
router.get('/:csrId/history', async (req, res) => {
	try {
		const csrId = Number(req.params.csrId);
		const type = req.query.type as string | undefined;
		const history = await controller.getHistory(csrId, type);
		res.json({ history });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch CSR history' });
	}
});



// GET /api/service-types
router.get('/service-types', async (req, res) => {
	try {
		// Import Drizzle ORM client and service_typeTable
		const { db } = require('../db/client');
		const { service_typeTable } = require('../db/schema/aiodb');
		// Query only non-deleted service types
			const serviceTypes: any[] = await db
				.select()
				.from(service_typeTable)
				.where(service_typeTable.deleted === false);
			// Return only the names
			res.json({ serviceTypes: serviceTypes.map((st: any) => st.name) });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch service types' });
	}
});

// GET /api/csr/locations
router.get('/locations', async (req, res) => {
	try {
		const { db } = require('../db/client');
		const { locationTable } = require('../db/schema/aiodb');
		const locations = await db.select().from(locationTable);
		res.json({ locations: locations.map((loc: any) => loc.name) });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch locations' });
	}
});

export default router;
