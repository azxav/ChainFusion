
// src/ai/flows/robot-ready-task-queues.ts

'use server';

/**
 * @fileOverview This file defines a Genkit flow for prioritizing pick-and-pack instructions for warehouse robots or human pickers.
 *
 * The flow takes into account the location of items, travel time, and order priority to optimize task queues.
 *
 * @interface RobotReadyTaskQueuesInput - Defines the input schema for the robot-ready task queues flow.
 * @interface RobotReadyTaskQueuesOutput - Defines the output schema for the robot-ready task queues flow.
 * @function robotReadyTaskQueues - An async function that processes the input and returns the prioritized task queue.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RobotReadyTaskQueuesInputSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().describe('Unique identifier for the item.'),
      location: z
        .string()
        .describe(
          'The location of the item in the warehouse (e.g., aisle and shelf).'
        ),
      quantity: z.number().int().positive().describe('Quantity of the item to pick.'),
    })
  ).describe('A list of items to be picked.'),
  orderPriority: z.enum(['high', 'medium', 'low']).describe('The priority of the order.'),
  robotCurrentLocation: z
    .string()
    .describe('The current location of the robot in the warehouse.'),
});

export type RobotReadyTaskQueuesInput = z.infer<typeof RobotReadyTaskQueuesInputSchema>;

const RobotReadyTaskQueuesOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      itemId: z.string().describe('Unique identifier for the item.'),
      location: z
        .string()
        .describe(
          'The location of the item in the warehouse (e.g., aisle and shelf).'
        ),
      quantity: z.number().int().min(1).describe('Quantity of the item to pick.'), // Changed from .positive()
      estimatedTravelTime: z
        .number()
        .describe('Estimated travel time to the item location in seconds.'),
      priorityScore: z.number().describe('A score indicating the priority of the task.'),
    })
  ).describe('A list of prioritized tasks for the robot or human picker.'),
});

export type RobotReadyTaskQueuesOutput = z.infer<typeof RobotReadyTaskQueuesOutputSchema>;

const robotReadyTaskQueuesPrompt = ai.definePrompt({
  name: 'robotReadyTaskQueuesPrompt',
  input: {schema: RobotReadyTaskQueuesInputSchema},
  output: {schema: RobotReadyTaskQueuesOutputSchema},
  prompt: `You are an AI assistant that prioritizes pick-and-pack instructions for warehouse robots or human pickers, minimizing travel time and considering order priority.

  Given the following items to pick:
  {{#each items}}
  - Item ID: {{this.itemId}}, Location: {{this.location}}, Quantity: {{this.quantity}}
  {{/each}}

  And the current robot location: {{robotCurrentLocation}}
  And the order priority: {{orderPriority}}

  Prioritize the tasks based on proximity to the robot's current location, travel time, and the order priority. Provide an estimated travel time to each item location and a priority score for each task. The priority score should reflect the urgency and efficiency of picking the item.

  Ensure that the outputted JSON is valid and matches the following schema:
  ${JSON.stringify(RobotReadyTaskQueuesOutputSchema.shape, null, 2)}
  `,
});

/**
 * Genkit flow to prioritize pick-and-pack instructions for warehouse robots or human pickers.
 * @param input - The input containing items to pick, order priority, and robot location.
 * @returns The prioritized task queue.
 */
export async function robotReadyTaskQueues(input: RobotReadyTaskQueuesInput): Promise<RobotReadyTaskQueuesOutput> {
  return robotReadyTaskQueuesFlow(input);
}

const robotReadyTaskQueuesFlow = ai.defineFlow(
  {
    name: 'robotReadyTaskQueuesFlow',
    inputSchema: RobotReadyTaskQueuesInputSchema,
    outputSchema: RobotReadyTaskQueuesOutputSchema,
  },
  async input => {
    // Call the prompt to get the prioritized tasks.
    const {output} = await robotReadyTaskQueuesPrompt(input);
    return output!;
  }
);

