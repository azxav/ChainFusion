// This is an AI-powered tool that explains why a shipment was flagged as high-risk, showing the feature contributions.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainabilityDashboardInputSchema = z.object({
  shipmentId: z.string().describe('The ID of the shipment to explain.'),
});
export type ExplainabilityDashboardInput = z.infer<typeof ExplainabilityDashboardInputSchema>;

const ExplainabilityDashboardOutputSchema = z.object({
  explanation: z.string().describe('An explanation of why the shipment was flagged as high-risk.'),
  featureContributions: z
    .array(z.object({
      feature: z.string().describe('The name of the feature.'),
      contribution: z.number().describe('The contribution of the feature to the risk score.'),
    }))
    .describe('A list of feature contributions to the risk score.'),
});
export type ExplainabilityDashboardOutput = z.infer<typeof ExplainabilityDashboardOutputSchema>;

export async function explainShipmentRisk(input: ExplainabilityDashboardInput): Promise<ExplainabilityDashboardOutput> {
  return explainShipmentRiskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainShipmentRiskPrompt',
  input: {schema: ExplainabilityDashboardInputSchema},
  output: {schema: ExplainabilityDashboardOutputSchema},
  prompt: `You are an AI assistant that explains why a shipment was flagged as high-risk.

  Provide an explanation of why shipment {{shipmentId}} was flagged as high-risk, including the contribution of each feature to the risk score.
  Be concise and clear in your explanation, and provide specific examples where possible.
  The feature contributions should be a numbered list, and it should be in markdown format.
  `,
});

const explainShipmentRiskFlow = ai.defineFlow(
  {
    name: 'explainShipmentRiskFlow',
    inputSchema: ExplainabilityDashboardInputSchema,
    outputSchema: ExplainabilityDashboardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
