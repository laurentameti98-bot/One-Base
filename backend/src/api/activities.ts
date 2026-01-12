import { Router } from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../domain/activities.js';

export const activitiesRouter = Router();

activitiesRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const search = req.query.q as string | undefined;
    const accountId = req.query.accountId as string | undefined;
    const contactId = req.query.contactId as string | undefined;
    const dealId = req.query.dealId as string | undefined;
    const type = req.query.type as string | undefined;
    const result = await getActivities(page, pageSize, search, accountId, contactId, dealId, type);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.get('/:id', async (req, res, next) => {
  try {
    const activity = await getActivityById(req.params.id);
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.post('/', async (req, res, next) => {
  try {
    const activity = await createActivity(req.body);
    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.put('/:id', async (req, res, next) => {
  try {
    const activity = await updateActivity(req.params.id, req.body);
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

activitiesRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteActivity(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
