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
import { 
  getSupplierVitalityScore, 
  SupplierVitalityScoreInputSchema,
  SupplierVitalityScoreOutputSchema 
} from './supplier-vitality-scorecards';
import { 
  getInventoryStressIndicators, 
  InventoryStressIndicatorsInputSchema,
  InventoryStressIndicatorsOutputSchema 
} from './inventory-stress-indicators';
import { 
  disruptionReplayAndForecast, 
  DisruptionReplayAndForecastInputSchema, 
  DisruptionReplayAndForecastOutputSchema 
} from './disruption-replay-and-forecast';
import { 
  findAlternativeSuppliers, 
  FindAlternativeSuppliersInputSchema,
  FindAlternativeSuppliersOutputSchema
} from './alternative-sourcing-engine';

// Define Tools

const supplierVitalityTool = ai.defineTool(
  {
    name: 'getSupplierVitalityScore',
    description: 'Retrieves a vitality scorecard for a specific supplier, including a risk score, assessment, and recommendations. Requires the supplierName. Other fields like financialHealth, deliveryHistory, newsSentiment, and geopoliticalIndicators are optional context the user might provide.',
    inputSchema: SupplierVitalityScoreInputSchema.extend({ // Make context fields optional for chat
        financialHealth: SupplierVitalityScoreInputSchema.shape.financialHealth.optional(),
        deliveryHistory: SupplierVitalityScoreInputSchema.shape.deliveryHistory.optional(),
        newsSentiment: SupplierVitalityScoreInputSchema.shape.newsSentiment.optional(),
        geopoliticalIndicators: SupplierVitalityScoreInputSchema.shape.geopoliticalIndicators.optional(),
    }),
    outputSchema: SupplierVitalityScoreOutputSchema,
  },
  async (input) => {
    // AI might not provide all optional fields, provide defaults or handle as needed
    const fullInput = {
        financialHealth: '', // Default if not provided
        deliveryHistory: '', // Default if not provided
        newsSentiment: '',   // Default if not provided
        geopoliticalIndicators: '', // Default if not provided
        ...input,
    };
    return await getSupplierVitalityScore(fullInput);
  }
);

const inventoryStressTool = ai.defineTool(
  {
    name: 'getInventoryStressIndicators',
    description: 'Predicts stock-out probability and time-to-empty for a given component. Requires componentName, currentStockLevel, averageDailyUsage, and leadTimeDays. HistoricalUsageData and forecastVolatility are optional but helpful context.',
    inputSchema: InventoryStressIndicatorsInputSchema.extend({ // Make context fields optional
        historicalUsageData: InventoryStressIndicatorsInputSchema.shape.historicalUsageData.optional(),
        forecastVolatility: InventoryStressIndicatorsInputSchema.shape.forecastVolatility.optional(),
    }),
    outputSchema: InventoryStressIndicatorsOutputSchema,
  },
  async (input) => {
     const fullInput = {
        historicalUsageData: 'Not provided by user.', // Default if not provided
        forecastVolatility: 0.1, // Default reasonable volatility if not provided
        ...input,
    };
    return await getInventoryStressIndicators(fullInput);
  }
);

const disruptionReplayTool = ai.defineTool(
  {
    name: 'simulateDisruptionImpact',
    description: 'Simulates the impact of a potential supply chain disruption on a production line. Requires disruptionType (e.g., "Port Congestion", "Supplier Bankruptcy"), disruptionDetails (specifics of the event), and the productionLine affected.',
    inputSchema: DisruptionReplayAndForecastInputSchema,
    outputSchema: DisruptionReplayAndForecastOutputSchema,
  },
  async (input) => await disruptionReplayAndForecast(input)
);

const alternativeSourcingTool = ai.defineTool(
  {
    name: 'findAlternativeSuppliers',
    description: 'Identifies and ranks alternative suppliers for a specific part. Requires partName, quantity, dueDate. Information about currentSupplier, reasonForShortage, and secondarySupplierDatabaseDescription is also very helpful context.',
    inputSchema: FindAlternativeSuppliersInputSchema.extend({ // Make context optional
        currentSupplier: FindAlternativeSuppliersInputSchema.shape.currentSupplier.optional(),
        reasonForShortage: FindAlternativeSuppliersInputSchema.shape.reasonForShortage.optional(),
        secondarySupplierDatabaseDescription: FindAlternativeSuppliersInputSchema.shape.secondarySupplierDatabaseDescription.optional(),
    }),
    outputSchema: FindAlternativeSuppliersOutputSchema,
  },
  async (input) => {
    const fullInput = {
        currentSupplier: 'Unknown',
        reasonForShortage: 'Not specified by user.',
        secondarySupplierDatabaseDescription: 'Default internal supplier database.',
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
  response: z.string().describe('The response to the supply chain manager.'),
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
  prompt: `You are "ChainFusion ChatOps Agent", a powerful AI assistant for supply chain managers. Your primary goal is to help users by answering their questions and performing tasks related to supply chain operations.

You have access to a suite of specialized tools to help you:
- 'getSupplierVitalityScore': Use this to provide a risk assessment for a supplier. Key input: 'supplierName'.
- 'getInventoryStressIndicators': Use this to predict stock-out risks for components. Key inputs: 'componentName', 'currentStockLevel', 'averageDailyUsage', 'leadTimeDays'.
- 'simulateDisruptionImpact': Use this to forecast the impact of supply chain disruptions. Key inputs: 'disruptionType', 'disruptionDetails', 'productionLine'.
- 'findAlternativeSuppliers': Use this to find and rank alternative suppliers for parts. Key inputs: 'partName', 'quantity', 'dueDate'.

When a user asks a question or makes a request:
1. Analyze the query to understand the user's intent.
2. Determine if any of your available tools can fulfill the request based on the query and tool descriptions.
3. If a tool is appropriate:
    a. Try to extract all necessary parameters for the tool from the user's query. Check the key inputs mentioned above for each tool.
    b. If essential parameters are missing or ambiguous for the chosen tool, **YOU MUST ask the user clarifying questions** to gather the required information before attempting to call the tool. For example, if the user asks for supplier vitality without naming one, ask "Which supplier's vitality score are you interested in?". If they ask to find alternatives without part details, ask for the part name, quantity needed, and due date.
    c. Once you have the necessary inputs, call the tool.
    d. After the tool provides its output (which will be structured data), **synthesize this information into a clear, concise, and conversational response for the user.** Do not just dump raw JSON. Highlight key findings and present them in an easy-to-understand paragraph or bullet points. For example, if 'getSupplierVitalityScore' returns a score and recommendations, say something like "Supplier X has a vitality score of Y. The key risk is Z, and it's recommended to A and B."
4. If no tool is suitable for the user's query, or if the query is a general question, try to answer directly based on your knowledge or state that you cannot fulfill the request with your current capabilities.
5. For general queries not requiring a specific tool, or if explicitly asked for a risk assessment report format (e.g., "give me a risk report for X"), you can optionally use the structured format below if it seems appropriate to convey the information. However, prioritize conversational summaries when presenting tool outputs.
   (The following is a fallback format, not the primary way to present tool outputs)
   🔍 Risk Assessment Report: [Item Name or ID]
   📦 Batch ID: [Batch Number]
   📅 Last Updated: [Date & Time] | ⏱ Real-Time Monitoring: ✅/❌

   🚨 Overall Risk Level:
   [Colored Icon] [Risk Level]
   [Short summary of main reason for risk status]
   (And so on for other sections like Key Risk Factors, Geospatial Insight, Recommended Action Plan, AI Confidence Score)

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
