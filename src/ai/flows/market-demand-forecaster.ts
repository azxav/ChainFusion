'use server';

/**
 * @fileOverview Predicts semiconductor shortages 6-8 weeks out by correlating global semiconductor order backlogs, electronics sales trends, and local production needs.
 *
 * - marketDemandForecaster - A function that predicts semiconductor shortages.
 * - MarketDemandForecasterInput - The input type for the marketDemandForecaster function.
 * - MarketDemandForecasterOutput - The return type for the marketDemandForecaster function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketDemandForecasterInputSchema = z.object({
  globalSemiconductorOrderBacklogs: z.string().describe('Data on global semiconductor order backlogs.'),
  electronicsSalesTrends: z.string().describe('Data on electronics sales trends.'),
  localProductionNeeds: z.string().describe('Data on local production needs.'),
});
export type MarketDemandForecasterInput = z.infer<typeof MarketDemandForecasterInputSchema>;

const MarketDemandForecasterOutputSchema = z.object({
  predictedShortages: z.string().describe('Predicted semiconductor shortages 6-8 weeks out.'),
  confidenceLevel: z.number().describe('Confidence level of the prediction (0-1).'),
  recommendations: z.string().describe('Recommendations for adjusting purchasing strategies proactively.'),
});
export type MarketDemandForecasterOutput = z.infer<typeof MarketDemandForecasterOutputSchema>;

export async function marketDemandForecaster(input: MarketDemandForecasterInput): Promise<MarketDemandForecasterOutput> {
  return marketDemandForecasterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketDemandForecasterPrompt',
  input: {schema: MarketDemandForecasterInputSchema},
  output: {schema: MarketDemandForecasterOutputSchema},
  prompt: `You are an expert supply chain analyst specializing in semiconductor market forecasting.

  Based on the following data, predict semiconductor shortages 6-8 weeks out, provide a confidence level for the prediction (0-1), and give recommendations for adjusting purchasing strategies proactively.

  Global Semiconductor Order Backlogs: {{{globalSemiconductorOrderBacklogs}}}
  Electronics Sales Trends: {{{electronicsSalesTrends}}}
  Local Production Needs: {{{localProductionNeeds}}}
  `,
});

const marketDemandForecasterFlow = ai.defineFlow(
  {
    name: 'marketDemandForecasterFlow',
    inputSchema: MarketDemandForecasterInputSchema,
    outputSchema: MarketDemandForecasterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
