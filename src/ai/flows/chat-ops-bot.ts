
// src/ai/flows/chat-ops-bot.ts
'use server';

/**
 * @fileOverview ChatOps bot for supply chain managers to query shipment risks, delays, and invoke other core supply chain operations.
 *
 * - chatOpsBot - A function that handles queries and invokes tools.
 * - ChatOpsBotInput - The input type for the chatOpsBot function.
 * - ChatOpsBotOutput - The return type for the chatOpsBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Import functions and schemas for the tools
import { getSupplierVitalityScore } from './supplier-vitality-scorecards';
import { 
    SupplierVitalityScoreInputSchema,
    SupplierVitalityScoreOutputSchema
} from './types/supplier-vitality-types';

import { getInventoryStressIndicators } from './inventory-stress-indicators';
import { 
    InventoryStressIndicatorsInputSchema,
    InventoryStressIndicatorsOutputSchema 
} from './types/inventory-stress-types';

import { disruptionReplayAndForecast } from './disruption-replay-and-forecast';
import { 
    DisruptionReplayAndForecastInputSchema, 
    DisruptionReplayAndForecastOutputSchema 
} from './types/disruption-replay-types';

import { findAlternativeSuppliers } from './alternative-sourcing-engine';
import {
    FindAlternativeSuppliersInputSchema,
    FindAlternativeSuppliersOutputSchema
} from './types/alternative-sourcing-types';


// Define Tools

const supplierVitalityTool = ai.defineTool(
  {
    name: 'getSupplierVitalityScore',
    description: 'Retrieves a vitality scorecard for a specific supplier, including a risk score, assessment, and recommendations. Requires the supplierName. Other fields like financialHealth, deliveryHistory, newsSentiment, and geopoliticalIndicators are optional context the user might provide. For demo purposes, generate plausible data if context fields are not fully provided.',
    inputSchema: SupplierVitalityScoreInputSchema.extend({ 
        financialHealth: SupplierVitalityScoreInputSchema.shape.financialHealth.optional(),
        deliveryHistory: SupplierVitalityScoreInputSchema.shape.deliveryHistory.optional(),
        newsSentiment: SupplierVitalityScoreInputSchema.shape.newsSentiment.optional(),
        geopoliticalIndicators: SupplierVitalityScoreInputSchema.shape.geopoliticalIndicators.optional(),
    }),
    outputSchema: SupplierVitalityScoreOutputSchema,
  },
  async (input) => {
    const fullInput = {
        financialHealth: 'Fictional financial data: Revenue $50M, Profit Margin 12%, Debt-to-Equity 0.4. Rating: Stable.',
        deliveryHistory: 'Fictional delivery history: 96% on-time delivery for past 500 shipments. Average lead time: 12 days.',
        newsSentiment: 'Recent positive sentiment from local business journals regarding new investments in Tashkent region.',
        geopoliticalIndicators: 'Operating in Uzbekistan (medium-risk, stable outlook). Some exposure to regional logistics challenges.',
        ...input,
    };
    return await getSupplierVitalityScore(fullInput);
  }
);

const inventoryStressTool = ai.defineTool(
  {
    name: 'getInventoryStressIndicators',
    description: 'Predicts stock-out probability and time-to-empty for a given component. Requires componentName, currentStockLevel, averageDailyUsage, and leadTimeDays. HistoricalUsageData and forecastVolatility are optional but helpful context. Generate plausible data for context if not provided.',
    inputSchema: InventoryStressIndicatorsInputSchema.extend({ 
        historicalUsageData: InventoryStressIndicatorsInputSchema.shape.historicalUsageData.optional(),
        forecastVolatility: InventoryStressIndicatorsInputSchema.shape.forecastVolatility.optional(),
    }),
    outputSchema: InventoryStressIndicatorsOutputSchema,
  },
  async (input) => {
     const fullInput = {
        historicalUsageData: `Fictional data: Past 3 months usage for ${input.componentName}: Month 1: ${input.averageDailyUsage * 30 * 0.9} units, Month 2: ${input.averageDailyUsage * 30 * 1.1} units, Month 3: ${input.averageDailyUsage * 30 * 1.05} units.`,
        forecastVolatility: 0.12, // Default reasonable volatility if not provided
        ...input,
    };
    return await getInventoryStressIndicators(fullInput);
  }
);

const disruptionReplayTool = ai.defineTool(
  {
    name: 'simulateDisruptionImpact',
    description: 'Simulates the impact of a potential supply chain disruption on a production line. Requires disruptionType (e.g., "Port Congestion", "Supplier Bankruptcy"), disruptionDetails (specifics of the event), and the productionLine affected. Provide specific, plausible impacts.',
    inputSchema: DisruptionReplayAndForecastInputSchema,
    outputSchema: DisruptionReplayAndForecastOutputSchema,
  },
  async (input) => await disruptionReplayAndForecast(input)
);

const alternativeSourcingTool = ai.defineTool(
  {
    name: 'findAlternativeSuppliers',
    description: 'Identifies and ranks alternative suppliers for a specific part. Requires partName, quantity, dueDate. Information about currentSupplier, reasonForShortage, and secondarySupplierDatabaseDescription is also very helpful context. If secondarySupplierDatabaseDescription is brief, assume a comprehensive global database of suppliers in the Asian region with relevant data points like capacity, lead time, quality certifications (e.g., ISO9001, IATF16949), and risk ratings for the demo.',
    inputSchema: FindAlternativeSuppliersInputSchema.extend({ 
        currentSupplier: FindAlternativeSuppliersInputSchema.shape.currentSupplier.optional(),
        reasonForShortage: FindAlternativeSuppliersInputSchema.shape.reasonForShortage.optional(),
        secondarySupplierDatabaseDescription: FindAlternativeSuppliersInputSchema.shape.secondarySupplierDatabaseDescription.optional(),
    }),
    outputSchema: FindAlternativeSuppliersOutputSchema,
  },
  async (input) => {
    const fullInput = {
        currentSupplier: input.currentSupplier || 'DefaultCorp Uzbekistan',
        reasonForShortage: input.reasonForShortage || 'Not specified by user, assuming standard supply chain query.',
        secondarySupplierDatabaseDescription: input.secondarySupplierDatabaseDescription || 'Global database of pre-vetted suppliers in Asia, focusing on electronics and automotive components. Contains capacity, lead times, certifications (ISO9001, IATF16949), and risk profiles (financial, geopolitical).',
        ...input,
    };
    return await findAlternativeSuppliers(fullInput);
  }
);


const ChatOpsBotInputSchema = z.object({
  query: z.string().describe('The query from the supply chain manager.'),
});
export type ChatOpsBotInput = z.infer<typeof ChatOpsBotInputSchema>;

const ChatOpsBotOutputSchema = z.object({
  response: z.string().describe('The response to the supply chain manager. This response should be conversational and informative, synthesizing any tool outputs into a readable format. It should sound like it is accessing real data, using specifics like IDs or metrics where appropriate for a convincing demo.'),
});
export type ChatOpsBotOutput = z.infer<typeof ChatOpsBotOutputSchema>;

export async function chatOpsBot(input: ChatOpsBotInput): Promise<ChatOpsBotOutput> {
  return chatOpsBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatOpsBotPrompt',
  input: {schema: ChatOpsBotInputSchema},
  output: {schema: ChatOpsBotOutputSchema},
  tools: [
    supplierVitalityTool, 
    inventoryStressTool,
    disruptionReplayTool,
    alternativeSourcingTool
  ],
  prompt: `You are "ChainFusion AI Agent", a powerful AI assistant for supply chain managers at a company based in Tashkent, Uzbekistan. Your primary goal is to help users by answering their questions and performing tasks related to supply chain operations, making it feel like you are accessing real-time data from a comprehensive system.
When responding, always aim to provide specific, data-driven insights. If you use a tool, synthesize its output into a clear, concise, and conversational response. For demo purposes, if the user's query for a tool is slightly vague or missing some context, you should generate plausible, realistic-sounding details (e.g., specific part numbers, quantities, locations in Central Asia or relevant trade regions, dates, company names) to make the interaction feel authentic. Avoid stating that data is "fictional" or "mock". Instead, present it as if it's from the system.

You have access to a suite of specialized tools:
- 'getSupplierVitalityScore': Use this to provide a risk assessment for a supplier. Key input: 'supplierName'.
- 'getInventoryStressIndicators': Use this to predict stock-out risks for components. Key inputs: 'componentName', 'currentStockLevel', 'averageDailyUsage', 'leadTimeDays'.
- 'simulateDisruptionImpact': Use this to forecast the impact of supply chain disruptions. Key inputs: 'disruptionType', 'disruptionDetails', 'productionLine'.
- 'findAlternativeSuppliers': Use this to find and rank alternative suppliers for parts. Key inputs: 'partName', 'quantity', 'dueDate'.

When a user asks a question or makes a request:
1. Analyze the query to understand the user's intent.
2. Determine if any of your available tools can fulfill the request based on the query and tool descriptions.
3. If a tool is appropriate:
    a. Try to extract all necessary parameters for the tool from the user's query. Check the key inputs mentioned above.
    b. If essential parameters are missing or ambiguous for the chosen tool, **YOU MUST ask the user clarifying questions** to gather the required information before attempting to call the tool. For example, if the user asks for supplier vitality without naming one, ask "Which supplier's vitality score are you interested in?". If they ask to find alternatives without part details, ask for the part name, quantity needed, and due date.
    c. Once you have the necessary inputs, call the tool.
    d. After the tool provides its output (which will be structured data), **synthesize this information into a clear, concise, and conversational response for the user.** Do not just dump raw JSON. Highlight key findings and present them in an easy-to-understand paragraph or bullet points. For example, if 'getSupplierVitalityScore' returns a score and recommendations, say something like "Supplier X (Tashkent Branch) has a vitality score of Y. The system flags a key risk related to Z, and it's recommended to A and B based on our latest data."
4. If no tool is suitable for the user's query, or if the query is a general question (e.g., "What's the risk on Semiconductor Batch #1234?", "Show me all shipments delayed over 12 hours"), try to answer directly based on your knowledge or by generating a plausible, detailed response as if querying a live database. For example, for "Batch #1234", you might respond: "Semiconductor Batch #1234 (Origin: Almalik Silicon Plant, Destination: Chirchik Assembly) currently shows a low-risk profile. Estimated arrival is on schedule for 2024-07-25. No adverse weather or customs flags reported on its route via the A373 highway."
5. Always maintain a professional, helpful, and slightly formal tone suitable for a business context in Uzbekistan.

User Query: {{{query}}}

Your Response:
`,
});

const chatOpsBotFlow = ai.defineFlow(
  {
    name: 'chatOpsBotFlow',
    inputSchema: ChatOpsBotInputSchema,
    outputSchema: ChatOpsBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

