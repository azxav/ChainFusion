// src/ai/flows/chat-ops-bot.ts
'use server';

/**
 * @fileOverview ChatOps bot for supply chain managers to query shipment risks and delays.
 *
 * - chatOpsBot - A function that handles queries about shipment risks and delays.
 * - ChatOpsBotInput - The input type for the chatOpsBot function.
 * - ChatOpsBotOutput - The return type for the chatOpsBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  prompt: `You are a helpful chat agent for supply chain managers. Answer the following question:
           give any simulated real world Answer for demo. Relate the anwers for Central Asia region and Asia: more like China and Taiwan
           respond using the following structured and informative format:
           🔍 Risk Assessment Report: [Item Name or ID]
📦 Batch ID: [Batch Number]
📅 Last Updated: [Date & Time] | ⏱ Real-Time Monitoring: ✅/❌

🚨 Overall Risk Level:
[Colored Icon] [Risk Level]

[Short summary of main reason for risk status]

📊 Key Risk Factors:
Risk Factor	Status	Details
Supplier Reliability	[Risk Level]	[Explanation]
Transit Route Exposure	[Risk Level]	[Explanation]
Inventory Buffer	[Risk Level]	[Explanation]
Component Quality Issues	[Risk Level]	[Explanation]

🌐 Geospatial Insight:
📍 [Location insight]
🛰 [AI-detected opportunity or alert]

📈 Recommended Action Plan:
[Action step with justification]

[Action step with justification]

[Action step with justification]

[Action step with justification]

🤖 AI Confidence Score: [Confidence %]
(Based on [#] historical data points and [#] relevant indicators)
        
{{{query}}}`,
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
