'use server';

/**
 * @fileOverview Predicts stock-out probability and 'time-to-empty' for components.
 *
 * - getInventoryStressIndicators - A function that returns stock-out probability forecasts and time-to-empty countdowns for each component.
 */

import {ai} from '@/ai/genkit';
import {
  InventoryStressIndicatorsInputSchema,
  type InventoryStressIndicatorsInput,
  InventoryStressIndicatorsOutputSchema,
  type InventoryStressIndicatorsOutput,
} from './types/inventory-stress-types';

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
  async (input: InventoryStressIndicatorsInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
