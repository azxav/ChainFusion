'use server';

/**
 * @fileOverview A flow to calculate optimal safety-stock levels per SKU.
 *
 * - calculateBufferStock - A function that calculates the recommended buffer stock level for a given SKU.
 * - CalculateBufferStockInput - The input type for the calculateBufferStock function.
 * - CalculateBufferStockOutput - The return type for the calculateBufferStock function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateBufferStockInputSchema = z.object({
  sku: z.string().describe('The Stock Keeping Unit (SKU) for the product.'),
  forecastVolatility: z
    .number()
    .describe(
      'A measure of how much the demand for the product is expected to vary.'
    ),
  leadTimeVariability: z
    .number()
    .describe(
      'A measure of how much the lead time for the product is expected to vary.'
    ),
  desiredServiceLevel: z
    .number()
    .describe(
      'The desired probability of not stocking out during the lead time (e.g., 0.95 for 95%).'
    ),
});
export type CalculateBufferStockInput = z.infer<
  typeof CalculateBufferStockInputSchema
>;

const CalculateBufferStockOutputSchema = z.object({
  recommendedBufferStock: z
    .number()
    .describe(
      'The recommended quantity of buffer stock to hold for the SKU, rounded to the nearest whole number.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of how the buffer stock level was calculated.'
    ),
});
export type CalculateBufferStockOutput = z.infer<
  typeof CalculateBufferStockOutputSchema
>;

export async function calculateBufferStock(
  input: CalculateBufferStockInput
): Promise<CalculateBufferStockOutput> {
  return calculateBufferStockFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateBufferStockPrompt',
  input: {schema: CalculateBufferStockInputSchema},
  output: {schema: CalculateBufferStockOutputSchema},
  prompt: `You are an experienced inventory planner.
  Given the following information about a product, calculate the recommended buffer stock level to hold.

  SKU: {{{sku}}}
  Forecast Volatility: {{{forecastVolatility}}}
  Lead Time Variability: {{{leadTimeVariability}}}
  Desired Service Level: {{{desiredServiceLevel}}}

  Consider the following when determining the buffer stock level:
  - Higher forecast volatility and lead time variability require higher buffer stock levels.
  - The desired service level represents the probability of not stocking out during the lead time. A higher service level requires a higher buffer stock level.

  Return the recommended buffer stock level as a whole number, along with a brief explanation of your reasoning.

  Ensure that the recommendedBufferStock value is always a non-negative integer.
  `,
});

const calculateBufferStockFlow = ai.defineFlow(
  {
    name: 'calculateBufferStockFlow',
    inputSchema: CalculateBufferStockInputSchema,
    outputSchema: CalculateBufferStockOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output,
      recommendedBufferStock: Math.max(0, Math.round(output!.recommendedBufferStock)),
    } as CalculateBufferStockOutput; // Type assertion to ensure non-negative integer
  }
);
