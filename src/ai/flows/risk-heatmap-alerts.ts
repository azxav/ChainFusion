// Risk Heatmap & Alerts [GenAI]: Real-time geospatial view of all inbound/outbound shipments, color-coded by AI-predicted delay risk (traffic, weather, customs).

'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating risk heatmap alerts for shipments.
 *
 * - `generateRiskHeatmapAlerts`: A function that generates risk heatmap alerts for shipments.
 * - `RiskHeatmapAlertsInput`: The input type for the `generateRiskHeatmapAlerts` function.
 * - `RiskHeatmapAlertsOutput`: The output type for the `generateRiskHeatmapAlerts` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RiskHeatmapAlertsInputSchema = z.object({
  shipmentDetails: z.array(
    z.object({
      shipmentId: z.string().describe('Unique identifier for the shipment.'),
      origin: z.string().describe('Origin location of the shipment.'),
      destination: z.string().describe('Destination location of the shipment.'),
      currentLocation: z.string().describe('Current location of the shipment.'),
      estimatedDeparture: z.string().describe('Estimated departure datetime of the shipment, ISO format.'),
      estimatedArrival: z.string().describe('Estimated arrival datetime of the shipment, ISO format.'),
      cargoDescription: z.string().describe('Description of the cargo being shipped.'),
    })
  ).describe('An array of shipment details.'),
});

export type RiskHeatmapAlertsInput = z.infer<typeof RiskHeatmapAlertsInputSchema>;

const RiskHeatmapAlertsOutputSchema = z.object({
  alerts: z.array(
    z.object({
      shipmentId: z.string().describe('The shipment ID the alert pertains to.'),
      riskScore: z.number().describe('A numerical risk score (0-1) indicating the likelihood of delay.'),
      delayReason: z.string().describe('The primary reason for the predicted delay (e.g., traffic, weather, customs).'),
      affectedRouteSegment: z.string().optional().describe('The specific segment of the route affected by the delay.'),
      suggestedAction: z.string().describe('A recommended action to mitigate the delay.'),
    })
  ).describe('An array of risk alerts for the provided shipments.'),
});

export type RiskHeatmapAlertsOutput = z.infer<typeof RiskHeatmapAlertsOutputSchema>;

export async function generateRiskHeatmapAlerts(input: RiskHeatmapAlertsInput): Promise<RiskHeatmapAlertsOutput> {
  return riskHeatmapAlertsFlow(input);
}

const riskHeatmapAlertsPrompt = ai.definePrompt({
  name: 'riskHeatmapAlertsPrompt',
  input: {schema: RiskHeatmapAlertsInputSchema},
  output: {schema: RiskHeatmapAlertsOutputSchema},
  prompt: `You are an AI logistics assistant that analyzes shipment data and predicts potential delays.

  Analyze the following shipment details and generate risk alerts for each shipment.
  Consider traffic, weather, and customs delays when predicting risk.

  Shipment Details:
  {{#each shipmentDetails}}
  Shipment ID: {{{shipmentId}}}
  Origin: {{{origin}}}
  Destination: {{{destination}}}
  Current Location: {{{currentLocation}}}
  Estimated Departure: {{{estimatedDeparture}}}
  Estimated Arrival: {{{estimatedArrival}}}
  Cargo Description: {{{cargoDescription}}}
  {{/each}}
  
  For each shipment, provide a risk score (0-1), a delay reason, the affected route segment (if applicable), and a suggested action.
  Ensure that the output is properly formatted JSON.
  `,
});

const riskHeatmapAlertsFlow = ai.defineFlow(
  {
    name: 'riskHeatmapAlertsFlow',
    inputSchema: RiskHeatmapAlertsInputSchema,
    outputSchema: RiskHeatmapAlertsOutputSchema,
  },
  async input => {
    const {output} = await riskHeatmapAlertsPrompt(input);
    return output!;
  }
);
