// This file defines the Zod schemas and TypeScript types for the supplier vitality scorecards flow.
// It does NOT use 'use server'.
import {z} from 'genkit';

export const SupplierVitalityScoreInputSchema = z.object({
  supplierName: z.string().describe('The name of the supplier.'),
  financialHealth: z.string().describe('Financial health data of the supplier.'),
  deliveryHistory: z.string().describe('Delivery history data of the supplier.'),
  newsSentiment: z.string().describe('News sentiment data related to the supplier.'),
  geopoliticalIndicators: z.string().describe('Geopolitical indicators relevant to the supplier.'),
});
export type SupplierVitalityScoreInput = z.infer<typeof SupplierVitalityScoreInputSchema>;

export const SupplierVitalityScoreOutputSchema = z.object({
  supplierName: z.string().describe('The name of the supplier.'),
  vitalityScore: z.number().describe('A risk score combining financial health, delivery history, news sentiment and geopolitical indicators.'),
  riskAssessment: z.string().describe('A risk assessment based on the vitality score.'),
  recommendations: z.string().describe('Recommendations to mitigate potential supplier-related risks.'),
});
export type SupplierVitalityScoreOutput = z.infer<typeof SupplierVitalityScoreOutputSchema>;
