import { z } from 'zod';
import { prisma } from '../data/prisma.js';
import { AppError } from '../api/errorHandler.js';

const ACTIVITY_TYPES = ['note', 'task', 'call', 'meeting'] as const;

const createActivitySchema = z.object({
  type: z.enum(['note', 'task', 'call', 'meeting'], {
    errorMap: () => ({ message: 'Invalid activity type' }),
  }),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().optional().or(z.null()),
  status: z.string().optional().or(z.null()),
  accountId: z.string().uuid('Invalid account ID').optional().or(z.null()),
  contactId: z.string().uuid('Invalid contact ID').optional().or(z.null()),
  dealId: z.string().uuid('Invalid deal ID').optional().or(z.null()),
  dueDate: z.string().optional().or(z.literal('')).transform((val) => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }),
}).refine(
  (data) => data.accountId || data.contactId || data.dealId,
  {
    message: 'Activity must be linked to at least one parent (Account, Contact, or Deal)',
    path: ['accountId'],
  }
);

export const updateActivitySchema = z.object({
  type: z.enum(['note', 'task', 'call', 'meeting'], {
    errorMap: () => ({ message: 'Invalid activity type' }),
  }).optional(),
  subject: z.string().min(1, 'Subject is required').optional(),
  body: z.string().optional().or(z.null()),
  status: z.string().optional().or(z.null()),
  accountId: z.string().uuid('Invalid account ID').optional().or(z.null()),
  contactId: z.string().uuid('Invalid contact ID').optional().or(z.null()),
  dealId: z.string().uuid('Invalid deal ID').optional().or(z.null()),
  dueDate: z.string().optional().or(z.literal('')).transform((val) => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    return isNaN(date.getTime()) ? undefined : date;
  }).optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;

export async function getActivities(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  accountId?: string,
  contactId?: string,
  dealId?: string,
  type?: string
) {
  const skip = (page - 1) * pageSize;
  
  const baseWhere: any = {
    deletedAt: null,
  };

  // Apply parent filters if specified
  if (accountId) {
    baseWhere.accountId = accountId;
    baseWhere.account = { deletedAt: null };
  }
  if (contactId) {
    baseWhere.contactId = contactId;
    baseWhere.contact = { deletedAt: null, account: { deletedAt: null } };
  }
  if (dealId) {
    baseWhere.dealId = dealId;
    baseWhere.deal = { deletedAt: null, account: { deletedAt: null } };
  }

  // If no specific parent filter, exclude activities with deleted parents
  if (!accountId && !contactId && !dealId) {
    baseWhere.AND = [
      {
        OR: [
          { account: { deletedAt: null } },
          { contact: { deletedAt: null, account: { deletedAt: null } } },
          { deal: { deletedAt: null, account: { deletedAt: null } } },
        ],
      },
    ];
  }

  let whereClause = baseWhere;

  // Add search filter
  if (search && search.trim()) {
    const searchTerm = search.trim();
    const searchFilter = {
      OR: [
        { subject: { contains: searchTerm } },
        { body: { contains: searchTerm } },
      ],
    };

    if (baseWhere.AND) {
      whereClause = {
        ...baseWhere,
        AND: [...baseWhere.AND, searchFilter],
      };
    } else {
      whereClause = {
        ...baseWhere,
        AND: [searchFilter],
      };
    }
  }

  if (type) {
    whereClause.type = type;
  }
  
  const [items, total] = await Promise.all([
    prisma.activity.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { account: true, contact: true, deal: true },
    }),
    prisma.activity.count({
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

export async function getActivityById(id: string) {
  const activity = await prisma.activity.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: { account: true, contact: { include: { account: true } }, deal: { include: { account: true } } },
  });

  if (!activity) {
    throw new AppError(404, 'Activity not found');
  }

  // Check if any parent is deleted
  if (activity.accountId && activity.account && activity.account.deletedAt) {
    throw new AppError(404, 'Activity not found');
  }
  if (activity.contactId && activity.contact) {
    if (activity.contact.deletedAt || activity.contact.account?.deletedAt) {
      throw new AppError(404, 'Activity not found');
    }
  }
  if (activity.dealId && activity.deal) {
    if (activity.deal.deletedAt || activity.deal.account?.deletedAt) {
      throw new AppError(404, 'Activity not found');
    }
  }

  return activity;
}

export async function createActivity(data: CreateActivityInput) {
  const validated = createActivitySchema.parse(data);
  
  // Verify at least one parent exists and is not deleted
  if (validated.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: validated.accountId, deletedAt: null },
    });
    if (!account) {
      throw new AppError(404, 'Account not found');
    }
  }
  if (validated.contactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: validated.contactId, deletedAt: null, account: { deletedAt: null } },
      include: { account: true },
    });
    if (!contact) {
      throw new AppError(404, 'Contact not found');
    }
  }
  if (validated.dealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: validated.dealId, deletedAt: null, account: { deletedAt: null } },
      include: { account: true },
    });
    if (!deal) {
      throw new AppError(404, 'Deal not found');
    }
  }

  return prisma.activity.create({
    data: {
      type: validated.type,
      subject: validated.subject,
      body: validated.body ?? null,
      status: validated.status ?? null,
      accountId: validated.accountId ?? null,
      contactId: validated.contactId ?? null,
      dealId: validated.dealId ?? null,
      dueDate: validated.dueDate ?? null,
    },
    include: { account: true, contact: true, deal: true },
  });
}

export async function updateActivity(id: string, data: UpdateActivityInput) {
  const activity = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
  });

  if (!activity) {
    throw new AppError(404, 'Activity not found');
  }

  const validated = updateActivitySchema.parse(data);

  // Build update data
  const updateData: any = {};
  if (validated.type !== undefined) updateData.type = validated.type;
  if (validated.subject !== undefined) updateData.subject = validated.subject;
  if (validated.body !== undefined) updateData.body = validated.body ?? null;
  if (validated.status !== undefined) updateData.status = validated.status ?? null;
  if (validated.accountId !== undefined) updateData.accountId = validated.accountId ?? null;
  if (validated.contactId !== undefined) updateData.contactId = validated.contactId ?? null;
  if (validated.dealId !== undefined) updateData.dealId = validated.dealId ?? null;
  if (validated.dueDate !== undefined) updateData.dueDate = validated.dueDate ?? null;

  // Enforce at least one parent after update
  const finalAccountId = updateData.accountId !== undefined ? updateData.accountId : activity.accountId;
  const finalContactId = updateData.contactId !== undefined ? updateData.contactId : activity.contactId;
  const finalDealId = updateData.dealId !== undefined ? updateData.dealId : activity.dealId;

  if (!finalAccountId && !finalContactId && !finalDealId) {
    throw new AppError(400, 'Activity must be linked to at least one parent (Account, Contact, or Deal)');
  }

  // Verify parent entities exist and are not deleted
  if (finalAccountId) {
    const account = await prisma.account.findFirst({
      where: { id: finalAccountId, deletedAt: null },
    });
    if (!account) {
      throw new AppError(404, 'Account not found');
    }
  }
  if (finalContactId) {
    const contact = await prisma.contact.findFirst({
      where: { id: finalContactId, deletedAt: null, account: { deletedAt: null } },
    });
    if (!contact) {
      throw new AppError(404, 'Contact not found');
    }
  }
  if (finalDealId) {
    const deal = await prisma.deal.findFirst({
      where: { id: finalDealId, deletedAt: null, account: { deletedAt: null } },
    });
    if (!deal) {
      throw new AppError(404, 'Deal not found');
    }
  }

  return prisma.activity.update({
    where: { id },
    data: updateData,
    include: { account: true, contact: true, deal: true },
  });
}

export async function deleteActivity(id: string) {
  const activity = await prisma.activity.findFirst({
    where: { id, deletedAt: null },
  });

  if (!activity) {
    throw new AppError(404, 'Activity not found');
  }

  return prisma.activity.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export const ACTIVITY_TYPES_LIST = ACTIVITY_TYPES;
