'use server';

/**
 * @fileOverview An AI-powered RFQ automation tool for identifying and engaging alternative suppliers.
 *
 * - findAlternativeSuppliers - A function that handles the process of finding alternative suppliers, ranking them, and drafting PO amendments.
 */

import {ai} from '@/ai/genkit';
import {
  FindAlternativeSuppliersInputSchema,
  type FindAlternativeSuppliersInput,
  FindAlternativeSuppliersOutputSchema,
  type FindAlternativeSuppliersOutput,
} from './types/alternative-sourcing-types';

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
  async (input: FindAlternativeSuppliersInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
