import { Router } from 'express';
import { ZodError } from 'zod';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../domain/contacts.js';
import { AppError } from './errorHandler.js';

export const contactsRouter = Router();

contactsRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const result = await getContacts(page, pageSize);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

contactsRouter.get('/:id', async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.id);
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

contactsRouter.post('/', async (req, res, next) => {
  try {
    const contact = await createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError(400, error.errors.map(e => e.message).join(', ')));
    } else {
      next(error);
    }
  }
});

contactsRouter.put('/:id', async (req, res, next) => {
  try {
    const contact = await updateContact(req.params.id, req.body);
    res.json(contact);
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError(400, error.errors.map(e => e.message).join(', ')));
    } else {
      next(error);
    }
  }
});

contactsRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteContact(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
