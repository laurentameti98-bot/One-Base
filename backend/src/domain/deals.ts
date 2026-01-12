import { z } from 'zod';
import { prisma } from '../data/prisma.js';
import { AppError } from '../api/errorHandler.js';

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;

export const createDealSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  name: z.string().min(1, 'Name is required'),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'], {
    errorMap: () => ({ message: 'Invalid stage' }),
  }),
  amount: z.number().positive().optional().or(z.null()),
  closeDate: z.string().optional().or(z.literal('')).transform((val) => {
    if (!val || val === '') return undefined;
    // Handle both ISO date strings and date-only strings (YYYY-MM-DD)
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }),
});

export const updateDealSchema = createDealSchema.partial();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export async function getDeals(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  accountId?: string,
  stage?: string
) {
  const skip = (page - 1) * pageSize;
  
  const whereClause: any = {
    deletedAt: null,
    account: {
      deletedAt: null,
    },
  };

  if (search && search.trim()) {
    whereClause.name = { contains: search.trim() };
  }

  if (accountId) {
    whereClause.accountId = accountId;
  }

  if (stage) {
    whereClause.stage = stage;
  }
  
  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { account: true },
    }),
    prisma.deal.count({
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

export async function getDealById(id: string) {
  const deal = await prisma.deal.findFirst({
    where: {
      id,
      deletedAt: null,
      account: {
        deletedAt: null,
      },
    },
    include: {
      account: true,
      activities: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!deal) {
    throw new AppError(404, 'Deal not found');
  }

  return deal;
}

export async function createDeal(data: CreateDealInput) {
  const validated = createDealSchema.parse(data);
  
  // Verify account exists and is not deleted
  const account = await prisma.account.findFirst({
    where: { id: validated.accountId, deletedAt: null },
  });

  if (!account) {
    throw new AppError(404, 'Account not found');
  }

  return prisma.deal.create({
    data: {
      accountId: validated.accountId,
      name: validated.name,
      stage: validated.stage,
      amount: validated.amount ?? null,
      closeDate: validated.closeDate ?? null,
    },
    include: { account: true },
  });
}

export async function updateDeal(id: string, data: UpdateDealInput) {
  const deal = await prisma.deal.findFirst({
    where: { id, deletedAt: null },
  });

  if (!deal) {
    throw new AppError(404, 'Deal not found');
  }

  const validated = updateDealSchema.parse(data);

  // If accountId is being updated, verify the new account exists
  if (validated.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: validated.accountId, deletedAt: null },
    });

    if (!account) {
      throw new AppError(404, 'Account not found');
    }
  }

  const updateData: any = {};
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.stage !== undefined) updateData.stage = validated.stage;
  if (validated.amount !== undefined) updateData.amount = validated.amount ?? null;
  if (validated.closeDate !== undefined) updateData.closeDate = validated.closeDate ?? null;
  if (validated.accountId !== undefined) updateData.accountId = validated.accountId;

  return prisma.deal.update({
    where: { id },
    data: updateData,
    include: { account: true },
  });
}

export async function deleteDeal(id: string) {
  const deal = await prisma.deal.findFirst({
    where: { id, deletedAt: null },
  });

  if (!deal) {
    throw new AppError(404, 'Deal not found');
  }

  const now = new Date();

  // Use a transaction to cascade soft-delete related Activities
  return prisma.$transaction(async (tx) => {
    // Soft-delete the deal
    await tx.deal.update({
      where: { id },
      data: { deletedAt: now },
    });

    // Soft-delete all related activities
    await tx.activity.updateMany({
      where: {
        dealId: id,
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    return { id, deletedAt: now };
  });
}

export const DEAL_STAGES_LIST = DEAL_STAGES;
