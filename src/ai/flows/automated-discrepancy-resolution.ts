'use server';
/**
 * @fileOverview This file defines a Genkit flow for automated discrepancy resolution in inventory management.
 *
 * - automatedDiscrepancyResolution - A function that orchestrates the discrepancy resolution process.
 * - AutomatedDiscrepancyResolutionInput - The input type for the automatedDiscrepancyResolution function.
 * - AutomatedDiscrepancyResolutionOutput - The return type for the automatedDiscrepancyResolution function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedDiscrepancyResolutionInputSchema = z.object({
  expectedCount: z.number().describe('The expected quantity of the item.'),
  actualCount: z.number().describe('The actual quantity of the item found during the count.'),
  itemIdentifier: z.string().describe('A unique identifier for the item (e.g., SKU, part number).'),
  location: z.string().describe('The location where the discrepancy was found (e.g., warehouse zone, shelf).'),
  lastKnownActivity: z.string().describe('A description of the last known activity associated with the item.'),
});
export type AutomatedDiscrepancyResolutionInput = z.infer<typeof AutomatedDiscrepancyResolutionInputSchema>;

const AutomatedDiscrepancyResolutionOutputSchema = z.object({
  likelyErrorSources: z.array(z.string()).describe('A list of potential reasons for the count discrepancy.'),
  workOrderDescription: z.string().describe('A detailed description of the work order to investigate the discrepancy.'),
});
export type AutomatedDiscrepancyResolutionOutput = z.infer<typeof AutomatedDiscrepancyResolutionOutputSchema>;

export async function automatedDiscrepancyResolution(input: AutomatedDiscrepancyResolutionInput): Promise<AutomatedDiscrepancyResolutionOutput> {
  return automatedDiscrepancyResolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedDiscrepancyResolutionPrompt',
  input: {schema: AutomatedDiscrepancyResolutionInputSchema},
  output: {schema: AutomatedDiscrepancyResolutionOutputSchema},
  prompt: `You are an expert inventory analyst tasked with resolving inventory discrepancies.

You are provided with the expected count, actual count, item identifier, location, and last known activity of an item.

Based on this information, you will identify the most likely error sources that could have caused the discrepancy and generate a work order description to guide the investigation.

Item Identifier: {{{itemIdentifier}}}
Location: {{{location}}}
Expected Count: {{{expectedCount}}}
Actual Count: {{{actualCount}}}
Last Known Activity: {{{lastKnownActivity}}}

Consider factors such as misplacement, theft, data entry errors, and process failures.
`,
});

const automatedDiscrepancyResolutionFlow = ai.defineFlow(
  {
    name: 'automatedDiscrepancyResolutionFlow',
    inputSchema: AutomatedDiscrepancyResolutionInputSchema,
    outputSchema: AutomatedDiscrepancyResolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
