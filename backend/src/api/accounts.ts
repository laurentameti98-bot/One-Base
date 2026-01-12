import { Router } from 'express';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../domain/accounts.js';

export const accountsRouter = Router();

accountsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    const search = req.query.q as string | undefined;
    const result = await getAccounts(page, pageSize, search);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.get('/:id', async (req, res, next) => {
  try {
    const account = await getAccountById(req.params.id);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

accountsRouter.post('/', async (req, res, next) => {
  try {
    const account = await createAccount(req.body);
    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
});

accountsRouter.put('/:id', async (req, res, next) => {
  try {
    const account = await updateAccount(req.params.id, req.body);
    res.json(account);
  } catch (error) {
    next(error);
  }
});

accountsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteAccount(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
