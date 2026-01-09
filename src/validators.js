const { z } = require("zod");

// Flexible currency schema - supports both new and legacy formats
const currencySchema = z.object({
  base: z.string().min(1),
  rates: z.record(z.string(), z.number()),
  funds: z
    .array(
      z.object({
        code: z.string(),
        amount: z.number(),
      })
    )
    .optional(),
});

const tripSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    // New flexible currency model (optional)
    currencies: currencySchema.optional(),
    // Legacy fields (optional if currencies is present)
    baseCurrency: z.string().min(1).optional(),
    secondaryCurrency: z.string().min(1).optional(),
    exchangeRateVndPerUsd: z.number().optional(),
    totalVndAvailable: z.number().optional(),
    totalUsdAvailable: z.number().optional(),
    days: z.array(z.any()),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    version: z.number().optional(),
  })
  .refine(
    (data) => {
      // If currencies is present, it's valid (new format)
      if (data.currencies) {
        return true;
      }
      // Legacy format: all legacy fields must be present and valid
      const hasLegacyFields =
        data.baseCurrency &&
        data.secondaryCurrency &&
        typeof data.exchangeRateVndPerUsd === "number" &&
        typeof data.totalVndAvailable === "number" &&
        typeof data.totalUsdAvailable === "number";
      return hasLegacyFields;
    },
    {
      message:
        "Either 'currencies' object or all legacy currency fields (baseCurrency, secondaryCurrency, exchangeRateVndPerUsd, totalVndAvailable, totalUsdAvailable) must be provided",
    }
  );

module.exports = { tripSchema };
