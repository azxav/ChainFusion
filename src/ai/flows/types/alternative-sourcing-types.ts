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
