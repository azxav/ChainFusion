// Cost vs. Time Trade-Off Simulator flow

'use server';

/**
 * @fileOverview An AI agent that simulates the cost vs. time trade-off for delivery.
 *
 * - costVsTimeTradeoffSimulator - A function that handles the cost vs. time trade-off simulation process.
 * - CostVsTimeTradeoffSimulatorInput - The input type for the costVsTimeTradeoffSimulator function.
 * - CostVsTimeTradeoffSimulatorOutput - The return type for the costVsTimeTradeoffSimulator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CostVsTimeTradeoffSimulatorInputSchema = z.object({
  shipmentDetails: z.string().describe('Details of the shipment including origin, destination, weight, and dimensions.'),
  originalDeliveryTime: z.number().describe('The original delivery time in hours.'),
  originalCost: z.number().describe('The original cost of the delivery in USD.'),
  timeReductionInHours: z.number().describe('The amount of time to reduce the delivery by, in hours.  Must be a positive number.'),
});
export type CostVsTimeTradeoffSimulatorInput = z.infer<typeof CostVsTimeTradeoffSimulatorInputSchema>;

const CostVsTimeTradeoffSimulatorOutputSchema = z.object({
  estimatedCost: z.number().describe('The estimated cost in USD to reduce the delivery time by the specified amount.'),
  deliveryTime: z.number().describe('The estimated delivery time in hours after the reduction.'),
  reasoning: z.string().describe('The reasoning behind the cost estimate, including factors such as expedited shipping fees and potential risks.'),
});
export type CostVsTimeTradeoffSimulatorOutput = z.infer<typeof CostVsTimeTradeoffSimulatorOutputSchema>;

export async function costVsTimeTradeoffSimulator(input: CostVsTimeTradeoffSimulatorInput): Promise<CostVsTimeTradeoffSimulatorOutput> {
  return costVsTimeTradeoffSimulatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'costVsTimeTradeoffSimulatorPrompt',
  input: {schema: CostVsTimeTradeoffSimulatorInputSchema},
  output: {schema: CostVsTimeTradeoffSimulatorOutputSchema},
  prompt: `You are a logistics expert specializing in cost optimization for shipments.

You are provided with the details of a shipment, its original delivery time and cost, and the desired time reduction.

Your task is to estimate the cost and delivery time if the delivery time is reduced by the specified amount.  Explain the factors such as expedited shipping fees and potential risks used to calculate the cost. Always provide the cost in US dollars.

Shipment Details: {{{shipmentDetails}}}
Original Delivery Time (hours): {{{originalDeliveryTime}}}
Original Cost (USD): {{{originalCost}}}
Time Reduction (hours): {{{timeReductionInHours}}}
`,
});

const costVsTimeTradeoffSimulatorFlow = ai.defineFlow(
  {
    name: 'costVsTimeTradeoffSimulatorFlow',
    inputSchema: CostVsTimeTradeoffSimulatorInputSchema,
    outputSchema: CostVsTimeTradeoffSimulatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
