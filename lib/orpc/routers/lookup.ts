import { z } from 'zod';
import { os } from '../base';
import { db } from '@/lib/db';
import { lookupItem } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export const lookupRouter = os.router({
  getByGroup: os
    .input(z.object({
      kdLookupGroup: z.string(),
    }))
    .handler(async ({ input }) => {
      const items = await db
        .select()
        .from(lookupItem)
        .where(eq(lookupItem.kdLookupGroup, input.kdLookupGroup))
        .orderBy(asc(lookupItem.kdLookupItem));

      return items.map(item => ({
        value: item.kdLookupItem,
        label: `${item.kdLookupItem}. ${item.nmLookupItem}`,
      }));
    }),

  getMultipleGroups: os
    .input(z.object({
      groups: z.array(z.string()),
    }))
    .handler(async ({ input }) => {
      const results: Record<string, { value: string, label: string }[]> = {};
      
      for (const group of input.groups) {
        const items = await db
          .select()
          .from(lookupItem)
          .where(eq(lookupItem.kdLookupGroup, group))
          .orderBy(asc(lookupItem.kdLookupItem));

        results[group] = items.map(item => ({
          value: item.kdLookupItem,
          label: `${item.kdLookupItem}. ${item.nmLookupItem}`,
        }));
      }

      return results;
    }),
});
