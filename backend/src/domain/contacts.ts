import { z } from 'zod';
import { prisma } from '../data/prisma.js';
import { AppError } from '../api/errorHandler.js';

export const createContactSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export async function getContacts(page: number = 1, pageSize: number = 20, search?: string) {
  const skip = (page - 1) * pageSize;
  
  const baseWhere: any = {
    deletedAt: null,
    account: {
      deletedAt: null,
    },
  };

  let whereClause = baseWhere;
  
  if (search && search.trim()) {
    const searchTerm = search.trim();
    whereClause = {
      ...baseWhere,
      OR: [
        { firstName: { contains: searchTerm } },
        { lastName: { contains: searchTerm } },
        { email: { contains: searchTerm } },
      ],
    };
  }
  
  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { account: true },
    }),
    prisma.contact.count({
      where: whereClause,
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getContactById(id: string) {
  const contact = await prisma.contact.findFirst({
    where: {
      id,
      deletedAt: null,
      account: {
        deletedAt: null,
      },
    },
    include: { account: true },
  });

  if (!contact) {
    throw new AppError(404, 'Contact not found');
  }

  return contact;
}

export async function createContact(data: CreateContactInput) {
  const validated = createContactSchema.parse(data);
  
  // Verify account exists and is not deleted
  const account = await prisma.account.findFirst({
    where: { id: validated.accountId, deletedAt: null },
  });

  if (!account) {
    throw new AppError(404, 'Account not found');
  }

  return prisma.contact.create({
    data: validated,
    include: { account: true },
  });
}

export async function updateContact(id: string, data: UpdateContactInput) {
  const contact = await prisma.contact.findFirst({
    where: { id, deletedAt: null },
  });

  if (!contact) {
    throw new AppError(404, 'Contact not found');
  }

  const validated = updateContactSchema.parse(data);

  // If accountId is being updated, verify the new account exists
  if (validated.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: validated.accountId, deletedAt: null },
    });

    if (!account) {
      throw new AppError(404, 'Account not found');
    }
  }

  return prisma.contact.update({
    where: { id },
    data: validated,
    include: { account: true },
  });
}

export async function deleteContact(id: string) {
  const contact = await prisma.contact.findFirst({
    where: { id, deletedAt: null },
  });

  if (!contact) {
    throw new AppError(404, 'Contact not found');
  }

  return prisma.contact.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
