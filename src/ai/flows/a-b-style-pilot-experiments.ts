// This is an AI-powered function that supports A/B testing of different AI model versions on a subset of shipments and promotes the best performing model.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ABTestInputSchema = z.object({
  shipmentData: z.string().describe('The shipment data to be evaluated.'),
  modelAVersion: z.string().describe('The identifier for model A version.'),
  modelBVersion: z.string().describe('The identifier for model B version.'),
  experimentPercentage: z.number().describe('The percentage of shipments to include in the A/B test.'),
  performanceMetric: z.string().describe('The performance metric to compare between models (e.g., delivery time, cost).'),
});
export type ABTestInput = z.infer<typeof ABTestInputSchema>;

const ABTestOutputSchema = z.object({
  winningModel: z.string().describe('The identifier of the winning model based on the performance metric.'),
  modelAPerformance: z.number().describe('The performance of model A on the test shipments.'),
  modelBPerformance: z.number().describe('The performance of model B on the test shipments.'),
  confidenceLevel: z.number().describe('The confidence level that the winning model is superior.'),
});
export type ABTestOutput = z.infer<typeof ABTestOutputSchema>;

export async function runABTest(input: ABTestInput): Promise<ABTestOutput> {
  return aBStylePilotExperimentsFlow(input);
}

const aBStylePilotExperimentsPrompt = ai.definePrompt({
  name: 'aBStylePilotExperimentsPrompt',
  input: {
    schema: ABTestInputSchema,
  },
  output: {
    schema: ABTestOutputSchema,
  },
  prompt: `You are an AI model evaluation expert. Given shipment data, two model versions (A and B), the percentage of shipments to include in the experiment, and a performance metric, determine which model performs better and provide a confidence level.

Shipment Data: {{{shipmentData}}}
Model A Version: {{{modelAVersion}}}
Model B Version: {{{modelBVersion}}}
Experiment Percentage: {{{experimentPercentage}}}
Performance Metric: {{{performanceMetric}}}

Based on the data, determine the winning model, its performance, and a confidence level.
Consider factors such as statistical significance and potential biases in the data.`, // Improved prompt instructions
});

const aBStylePilotExperimentsFlow = ai.defineFlow(
  {
    name: 'aBStylePilotExperimentsFlow',
    inputSchema: ABTestInputSchema,
    outputSchema: ABTestOutputSchema,
  },
  async input => {
    const {output} = await aBStylePilotExperimentsPrompt(input);
    return output!;
  }
);
