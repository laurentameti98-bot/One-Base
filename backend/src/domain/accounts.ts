import { z } from 'zod';
import { prisma } from '../data/prisma.js';
import { AppError } from '../api/errorHandler.js';

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export async function getAccounts(page: number = 1, pageSize: number = 20, search?: string) {
  const skip = (page - 1) * pageSize;
  
  const whereClause: any = {
    deletedAt: null,
  };

  if (search && search.trim()) {
    // For SQLite, Prisma converts contains to LIKE '%value%'
    whereClause.name = { contains: search.trim() };
  }
  
  const [items, total] = await Promise.all([
    prisma.account.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.account.count({
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

export async function getAccountById(id: string) {
  const account = await prisma.account.findFirst({
    where: { id, deletedAt: null },
    include: {
      contacts: { where: { deletedAt: null } },
      deals: { where: { deletedAt: null } },
    },
  });

  if (!account) {
    throw new AppError(404, 'Account not found');
  }

  return account;
}

export async function createAccount(data: CreateAccountInput) {
  const validated = createAccountSchema.parse(data);
  return prisma.account.create({
    data: validated,
  });
}

export async function updateAccount(id: string, data: UpdateAccountInput) {
  const account = await prisma.account.findFirst({
    where: { id, deletedAt: null },
  });

  if (!account) {
    throw new AppError(404, 'Account not found');
  }

  const validated = updateAccountSchema.parse(data);
  return prisma.account.update({
    where: { id },
    data: validated,
  });
}

export async function deleteAccount(id: string) {
  const account = await prisma.account.findFirst({
    where: { id, deletedAt: null },
  });

  if (!account) {
    throw new AppError(404, 'Account not found');
  }

  return prisma.account.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
