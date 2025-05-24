'use server';

/**
 * @fileOverview An AI-powered RFQ automation tool for identifying and engaging alternative suppliers.
 *
 * - findAlternativeSuppliers - A function that handles the process of finding alternative suppliers, ranking them, and drafting PO amendments.
 * - FindAlternativeSuppliersInputSchema - The Zod schema for the input.
 * - FindAlternativeSuppliersInput - The input type for the findAlternativeSuppliers function.
 * - FindAlternativeSuppliersOutputSchema - The Zod schema for the output.
 * - FindAlternativeSuppliersOutput - The return type for the findAlternativeSuppliers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FindAlternativeSuppliersInputSchema = z.object({
  partName: z.string().describe('The name of the part needed.'),
  quantity: z.number().describe('The quantity of the part needed.'),
  dueDate: z.string().describe('The date the part is needed by.'),
  currentSupplier: z.string().describe('The name of the current supplier.'),
  reasonForShortage: z.string().describe('The reason for the shortage from the current supplier.'),
  secondarySupplierDatabaseDescription: z.string().describe('Description of the curated database of secondary suppliers, including fields like fit, capacity, risk, location, and certifications.'),
});
export type FindAlternativeSuppliersInput = z.infer<typeof FindAlternativeSuppliersInputSchema>;

export const FindAlternativeSuppliersOutputSchema = z.object({
  alternativeSuppliers: z.array(
    z.object({
      supplierName: z.string().describe('The name of the alternative supplier.'),
      fitScore: z.number().describe('A score indicating how well the supplier fits the requirements.'),
      capacityScore: z.number().describe('A score indicating the supplier’s capacity to fulfill the order.'),
      riskScore: z.number().describe('A score indicating the risk associated with using this supplier.'),
      poAmendmentDraft: z.string().describe('A draft of the purchase order amendment for this supplier.'),
    })
  ).describe('A ranked list of alternative suppliers with their fit, capacity, and risk scores, and a draft PO amendment.'),
});
export type FindAlternativeSuppliersOutput = z.infer<typeof FindAlternativeSuppliersOutputSchema>;

export async function findAlternativeSuppliers(input: FindAlternativeSuppliersInput): Promise<FindAlternativeSuppliersOutput> {
  return findAlternativeSuppliersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findAlternativeSuppliersPrompt',
  input: {schema: FindAlternativeSuppliersInputSchema},
  output: {schema: FindAlternativeSuppliersOutputSchema},
  prompt: `You are a sourcing manager tasked with finding alternative suppliers for a part that is currently unavailable from the current supplier.
  You have access to a curated database of secondary suppliers, described as follows: {{{secondarySupplierDatabaseDescription}}}.
  Using this database, you will rank the suppliers by fit, capacity, and risk, and draft a purchase order amendment for each supplier.

  The part needed is: {{{partName}}}
  The quantity needed is: {{{quantity}}}
  The due date is: {{{dueDate}}}
  The current supplier is: {{{currentSupplier}}}
  The reason for the shortage is: {{{reasonForShortage}}}

  Based on the above information, please provide a ranked list of alternative suppliers with their fit, capacity, and risk scores, and a draft PO amendment.
  Ensure that the poAmendmentDraft includes the correct quantity, part name, and due date.
  `,
});

const findAlternativeSuppliersFlow = ai.defineFlow(
  {
    name: 'findAlternativeSuppliersFlow',
    inputSchema: FindAlternativeSuppliersInputSchema,
    outputSchema: FindAlternativeSuppliersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
