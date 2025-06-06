
// This is an autogenerated file from Firebase Studio.
'use server';
/**
 * @fileOverview Monitors model inputs for data drift and flags when retraining is needed.
 *
 * - detectDataDrift - A function that detects data drift and recommends retraining.
 * - DetectDataDriftInput - The input type for the detectDataDrift function.
 * - DetectDataDriftOutput - The return type for the detectDataDrift function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDataDriftInputSchema = z.object({
  modelName: z.string().describe('The name of the model to monitor.'),
  inputDataSample: z.record(z.any()).describe('A sample of recent input data for the model.'),
  baselineDataSummary: z
    .record(z.any())
    .describe('A summary of the baseline input data used to train the model.'),
  driftThreshold: z
    .number()
    .describe(
      'The threshold above which data drift is considered significant and retraining is recommended.'
    ),
});
export type DetectDataDriftInput = z.infer<typeof DetectDataDriftInputSchema>;

const DetectDataDriftOutputSchema = z.object({
  driftDetected: z.boolean().describe('Whether data drift has been detected.'),
  driftMetrics: z.object({
    // This is a placeholder to ensure the 'properties' field for this object is not empty in the generated JSON schema.
    // The actual metrics will be dynamic key-value pairs as described below.
    _schema_placeholder_metric_: z.number().optional().describe("An example internal placeholder, not meant for actual data output unless relevant."),
  }).catchall(z.number()).describe('Metrics quantifying the data drift. This will be an object where each key is a metric name (string) and the value is the metric score (number). For example: {"wasserstein_distance": 0.23, "psi_feature_x": 0.15}'),
  recommendRetraining: z
    .boolean()
    .describe('Whether retraining is recommended based on the detected drift.'),
  explanation: z
    .string()
    .describe('Explanation of why drift was detected and retraining is recommended.'),
});
export type DetectDataDriftOutput = z.infer<typeof DetectDataDriftOutputSchema>;

export async function detectDataDrift(input: DetectDataDriftInput): Promise<DetectDataDriftOutput> {
  return detectDataDriftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDataDriftPrompt',
  input: {schema: DetectDataDriftInputSchema},
  output: {schema: DetectDataDriftOutputSchema},
  prompt: `You are a data scientist responsible for monitoring the performance of machine learning models.

You are given a model name, a sample of recent input data, a summary of the baseline data used to train the model, and a drift threshold.

Your task is to determine if data drift has occurred, quantify the drift, and recommend whether the model should be retrained.

Model Name: {{{modelName}}}

Recent Input Data Sample: {{{inputDataSample}}}

Baseline Data Summary: {{{baselineDataSummary}}}

Drift Threshold: {{{driftThreshold}}}

Analyze the recent input data sample and compare it to the baseline data summary. Calculate drift metrics to quantify the difference between the two datasets. If the drift metrics exceed the specified drift threshold, it indicates that data drift has occurred, and retraining is recommended.

Consider factors such as changes in data distribution, new data patterns, and missing values when assessing data drift. Provide a clear explanation of why drift was detected and why retraining is recommended.

Based on your analysis, set the driftDetected, driftMetrics, recommendRetraining, and explanation fields in the output.

Follow the schema of DetectDataDriftOutputSchema. The driftMetrics should be a key value pair with the keys being the names of the metrics and the values being the values of the metrics.
`,
});

const detectDataDriftFlow = ai.defineFlow(
  {
    name: 'detectDataDriftFlow',
    inputSchema: DetectDataDriftInputSchema,
    outputSchema: DetectDataDriftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

