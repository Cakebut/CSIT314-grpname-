

import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { PersonInNeedControllers } from '../controller/PersonInNeedControllers';
import { db } from "../index";
import { urgency_levelTable, locationTable ,service_typeTable} from "../db/schema/aiodb";


const router = Router();
const controller = new PersonInNeedControllers();

// Get all PIN requests
router.get('/requests', async (req, res) => {
	try {
		const requests = await controller.getAllRequests();
		return res.json({ success: true, data: requests });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to fetch requests' });
	}
});

// Get all requests for a specific PIN user
router.get('/requests/user/:pin_id', async (req, res) => {
	const pin_id = Number(req.params.pin_id);
	if (!pin_id) {
		return res.status(400).json({ success: false, error: 'Missing pin_id' });
	}
	try {
		const requests = await controller.getRequestsByPinId(pin_id);
		return res.json({ success: true, data: requests });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to fetch user requests' });
	}
});

// Create a new request
router.post('/requests', async (req, res) => {
	const { pin_id, csr_id, title, categoryID, message, locationID, urgencyLevelID } = req.body;
	if (!pin_id || !title || !categoryID) {
		return res.status(400).json({ success: false, error: 'Missing required fields' });
	}
	try {
		const request = await controller.createRequest({ pin_id, csr_id, title, categoryID, message, locationID, urgencyLevelID });
		return res.status(201).json({ success: true, data: request });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to create request' });
	}
});


// Update a request by ID
router.put('/requests/:id', async (req, res) => {
	const id = Number(req.params.id);
	if (!id) {
		return res.status(400).json({ success: false, error: 'Missing or invalid request id' });
	}
	try {
		const updated = await controller.updateRequest(id, req.body);
		if (!updated) {
			return res.status(404).json({ success: false, error: 'Request not found' });
		}
		return res.json({ success: true, data: updated });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to update request' });
	}
});

// Delete a request by ID
router.delete('/requests/:id', async (req, res) => {
	const id = Number(req.params.id);
	if (!id) {
		return res.status(400).json({ success: false, error: 'Missing or invalid request id' });
	}
	try {
		const deleted = await controller.deleteRequest(id);
		if (!deleted) {
			return res.status(404).json({ success: false, error: 'Request not found' });
		}
		return res.json({ success: true });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to delete request' });
	}
});

// Increment view count for a request
router.post('/requests/:id/increment-view', async (req, res) => {
	const id = Number(req.params.id);
	if (!id) {
		return res.status(400).json({ success: false, error: 'Missing or invalid request id' });
	}
	try {
		await controller.incrementViewCount(id);
		return res.json({ success: true });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to increment view count' });
	}
});

// Increment shortlist count for a request
router.post('/requests/:id/increment-shortlist', async (req, res) => {
	const id = Number(req.params.id);
	if (!id) {
		return res.status(400).json({ success: false, error: 'Missing or invalid request id' });
	}
	try {
		await controller.incrementShortlistCount(id);
		return res.json({ success: true });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to increment shortlist count' });
	}
});


router.get('/urgency-levels', async (req, res) => {
	try {
		const levels = await db.select().from(urgency_levelTable);
		res.json({ data: levels });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch urgency levels' });
	}
});

router.get('/locations', async (req, res) => {
  try {
    const locations = await db.select().from(locationTable);
    res.json({ data: locations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});



// Get all service types (for dropdowns etc)
router.get('/service-types', async (req, res) => {
  try {
    const types = await db.select().from(service_typeTable).where(eq(service_typeTable.deleted, false));
    res.json({ data: types });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch service types' });
  }
});

// Get notifications for a PIN user
router.get('/notifications/:pin_id', async (req, res) => {
	const pin_id = Number(req.params.pin_id);
	if (!pin_id) {
		return res.status(400).json({ success: false, error: 'Missing pin_id' });
	}
	try {
		const notifications = await controller.getNotifications(pin_id);
		return res.json({ success: true, data: notifications });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
	}
});

export default router;

// Download CSV history for a PIN user (BCE: router -> controller -> entity)
router.get('/requests/history', async (req, res) => {
	try {
		const csv = await controller.getRequestsHistoryCSV();
		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="service-history.csv"');
		return res.send(csv);
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to generate CSV' });
	}
});


// My Offers: Get all offers for a PIN user (all requests + interested CSRs)
router.get('/offers/:pin_id', async (req, res) => {
	const pin_id = Number(req.params.pin_id);
	if (!pin_id) {
		return res.status(400).json({ success: false, error: 'Missing pin_id' });
	}
	try {
		const offers = await controller.getOffersByPinId(pin_id);
		return res.json({ success: true, data: offers });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to fetch offers' });
	}
});

// My Offers: Accept a CSR for a request
router.post('/offers/:requestId/accept', async (req, res) => {
	const requestId = Number(req.params.requestId);
	const { csrId } = req.body;
	if (!requestId || !csrId) {
		return res.status(400).json({ success: false, error: 'Missing requestId or csrId' });
	}
	try {
		const result = await controller.acceptCsrForRequest(requestId, csrId);
		return res.json({ success: true, data: result });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to accept CSR' });
	}
});

// My Offers: Cancel a CSR's interest for a request
router.post('/offers/:requestId/cancel', async (req, res) => {
	const requestId = Number(req.params.requestId);
	const { csrId } = req.body;
	if (!requestId || !csrId) {
		return res.status(400).json({ success: false, error: 'Missing requestId or csrId' });
	}
	try {
		const result = await controller.cancelCsrInterest(requestId, csrId);
		return res.json({ success: true, data: result });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to cancel CSR interest' });
	}
});
// Delete a notification by id
router.delete('/notifications/:id', async (req, res) => {
	const id = Number(req.params.id);
	if (!id) {
		return res.status(400).json({ success: false, error: 'Missing notification id' });
	}
	try {
		await controller.deleteNotification(id);
		return res.json({ success: true });
	} catch (err) {
		return res.status(500).json({ success: false, error: 'Failed to delete notification' });
	}
});