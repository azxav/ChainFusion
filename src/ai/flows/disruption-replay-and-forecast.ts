
'use server';

/**
 * @fileOverview This file defines a Genkit flow for simulating the impact of supply chain disruptions.
 *
 * - disruptionReplayAndForecast - Simulates the impact of a disruption on the production line.
 * - DisruptionReplayAndForecastInput - The input type for the disruptionReplayAndForecast function.
 * - DisruptionReplayAndForecastOutput - The return type for the disruptionReplayAndForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisruptionReplayAndForecastInputSchema = z.object({
  disruptionType: z
    .string()
    .describe(
      'The type of disruption to simulate (e.g., semiconductor outage, border closure).'
    ),
  disruptionDetails: z
    .string()
    .describe('Details about the disruption, such as the specific components affected or the duration of the closure.'),
  productionLine: z.string().describe('The production line to analyze.'),
});
export type DisruptionReplayAndForecastInput = z.infer<
  typeof DisruptionReplayAndForecastInputSchema
>;

const DisruptionReplayAndForecastOutputSchema = z.object({
  impactSummary: z.string().describe('A summary of the disruption impact on the production line.'),
  affectedComponents: z
    .array(z.string())
    .describe('A list of components affected by the disruption.'),
  estimatedDelay: z.string().describe('The estimated delay in production due to the disruption.'),
  recommendedActions: z
    .array(z.string())
    .describe('Recommended actions to mitigate the impact of the disruption.'),
});
export type DisruptionReplayAndForecastOutput = z.infer<
  typeof DisruptionReplayAndForecastOutputSchema
>;

export async function disruptionReplayAndForecast(
  input: DisruptionReplayAndForecastInput
): Promise<DisruptionReplayAndForecastOutput> {
  return disruptionReplayAndForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'disruptionReplayAndForecastPrompt',
  input: {schema: DisruptionReplayAndForecastInputSchema},
  output: {schema: DisruptionReplayAndForecastOutputSchema},
  prompt: `You are a supply chain analyst specializing in risk assessment and mitigation.

You are tasked with simulating the impact of a disruption on a production line.

Disruption Type: {{{disruptionType}}}
Disruption Details: {{{disruptionDetails}}}
Production Line: {{{productionLine}}}

Analyze the potential impact of the disruption on the production line, identify affected components,
estimate the delay in production, and recommend actions to mitigate the impact.

Respond with JSON that contains:
impactSummary: A summary of the disruption impact on the production line.
affectedComponents: A list of components affected by the disruption.
estimatedDelay: The estimated delay in production due to the disruption.
recommendedActions: Recommended actions to mitigate the impact of the disruption.`,
});

const disruptionReplayAndForecastFlow = ai.defineFlow(
  {
    name: 'disruptionReplayAndForecastFlow',
    inputSchema: DisruptionReplayAndForecastInputSchema,
    outputSchema: DisruptionReplayAndForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

