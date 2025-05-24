import {z} from 'genkit';

export const InventoryStressIndicatorsInputSchema = z.object({
  componentName: z.string().describe('The name of the component.'),
  currentStockLevel: z.number().describe('The current stock level of the component.'),
  averageDailyUsage: z.number().describe('The average daily usage of the component.'),
  leadTimeDays: z.number().describe('The lead time in days to replenish the component.'),
  historicalUsageData: z.string().describe('Historical usage data for the component.'),
  forecastVolatility: z.number().describe('Forecast volatility for the component.'),
});
export type InventoryStressIndicatorsInput = z.infer<typeof InventoryStressIndicatorsInputSchema>;

export const InventoryStressIndicatorsOutputSchema = z.object({
  stockOutProbability: z
    .number()
    .describe(
      'The probability (0-1) of a stock-out occurring before the next replenishment, based on usage patterns and forecast volatility.'
    ),
  timeToEmpty: z
    .number()
    .describe(
      'The estimated time to empty (in days) based on current stock levels and average daily usage.'
    ),
  restockRecommendation: z
    .string()
    .describe(
      'A recommendation on when to restock the component based on the stock-out probability and time to empty.'
    ),
});
export type InventoryStressIndicatorsOutput = z.infer<typeof InventoryStressIndicatorsOutputSchema>;
