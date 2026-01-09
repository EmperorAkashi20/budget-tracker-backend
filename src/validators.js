const { z } = require("zod");

const tripSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  baseCurrency: z.string().min(1),
  secondaryCurrency: z.string().min(1),
  exchangeRateVndPerUsd: z.number(),
  totalVndAvailable: z.number(),
  totalUsdAvailable: z.number(),
  days: z.array(z.any()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  version: z.number().optional(),
});

module.exports = { tripSchema };





