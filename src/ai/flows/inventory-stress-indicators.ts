'use server';

/**
 * @fileOverview Predicts stock-out probability and 'time-to-empty' for components.
 *
 * - getInventoryStressIndicators - A function that returns stock-out probability forecasts and time-to-empty countdowns for each component.
 * - InventoryStressIndicatorsInputSchema - The Zod schema for the input.
 * - InventoryStressIndicatorsInput - The input type for the getInventoryStressIndicators function.
 * - InventoryStressIndicatorsOutputSchema - The Zod schema for the output.
 * - InventoryStressIndicatorsOutput - The return type for the getInventoryStressIndicators function.
 */

import {ai} from '@/ai/genkit';
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

export async function getInventoryStressIndicators(
  input: InventoryStressIndicatorsInput
): Promise<InventoryStressIndicatorsOutput> {
  return inventoryStressIndicatorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inventoryStressIndicatorsPrompt',
  input: {schema: InventoryStressIndicatorsInputSchema},
  output: {schema: InventoryStressIndicatorsOutputSchema},
  prompt: `You are an AI assistant specializing in warehouse management and inventory optimization.

  Given the following information about a component, predict the stock-out probability, time to empty, and provide a restock recommendation.

  Component Name: {{{componentName}}}
  Current Stock Level: {{{currentStockLevel}}}
  Average Daily Usage: {{{averageDailyUsage}}}
  Lead Time (Days): {{{leadTimeDays}}}
  Historical Usage Data: {{{historicalUsageData}}}
  Forecast Volatility: {{{forecastVolatility}}}

  Consider the lead time, usage patterns, and forecast volatility when determining the stock-out probability and restock recommendation.
  The stockOutProbability field should be a number between 0 and 1, representing the likelihood of a stock-out.
  The timeToEmpty field should represent how many days until we run out of stock.
`,
});

const inventoryStressIndicatorsFlow = ai.defineFlow(
  {
    name: 'inventoryStressIndicatorsFlow',
    inputSchema: InventoryStressIndicatorsInputSchema,
    outputSchema: InventoryStressIndicatorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
