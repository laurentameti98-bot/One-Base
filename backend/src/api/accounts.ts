import { Router } from 'express';
import { ZodError } from 'zod';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../domain/accounts.js';
import { AppError } from './errorHandler.js';

export const accountsRouter = Router();

accountsRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await getAccounts(page, pageSize);
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
    if (error instanceof ZodError) {
      next(new AppError(400, error.errors.map(e => e.message).join(', ')));
    } else {
      next(error);
    }
  }
});

accountsRouter.put('/:id', async (req, res, next) => {
  try {
    const account = await updateAccount(req.params.id, req.body);
    res.json(account);
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError(400, error.errors.map(e => e.message).join(', ')));
    } else {
      next(error);
    }
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
