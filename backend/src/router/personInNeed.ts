
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
export default router;
