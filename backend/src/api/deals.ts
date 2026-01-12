import { Router } from 'express';
import {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
} from '../domain/deals.js';

export const dealsRouter = Router();

dealsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const search = req.query.q as string | undefined;
    const accountId = req.query.accountId as string | undefined;
    const stage = req.query.stage as string | undefined;
    const result = await getDeals(page, pageSize, search, accountId, stage);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

dealsRouter.get('/:id', async (req, res, next) => {
  try {
    const deal = await getDealById(req.params.id);
    res.json(deal);
  } catch (error) {
    next(error);
  }
});

dealsRouter.post('/', async (req, res, next) => {
  try {
    const deal = await createDeal(req.body);
    res.status(201).json(deal);
  } catch (error) {
    next(error);
  }
});

dealsRouter.put('/:id', async (req, res, next) => {
  try {
    const deal = await updateDeal(req.params.id, req.body);
    res.json(deal);
  } catch (error) {
    next(error);
  }
});

dealsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteDeal(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
