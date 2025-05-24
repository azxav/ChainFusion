import {z} from 'genkit';

export const DisruptionReplayAndForecastInputSchema = z.object({
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

export const DisruptionReplayAndForecastOutputSchema = z.object({
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
