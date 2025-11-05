/**
 * Shared Treatment Plan Data Types
 * 
 * These types are used across multiple forms and tables:
 * - Consultation Form (consultations.treatment_plan)
 * - Treatment Plan Form (treatment_plan_forms.treatments)
 * - Patient Profile Treatment Plans
 * 
 * Maintaining consistency ensures data can be easily migrated between forms.
 */

/**
 * Procedure Data Structure
 * Represents a single procedure within a treatment
 */
export interface ProcedureData {
  id: string;
  name: string;
  cdt_code?: string;
  cpt_code?: string;
  cost?: string;  // Stored as string to preserve decimal precision
  quantity: number;
}

/**
 * Treatment Data Structure
 * Represents a complete treatment with multiple procedures
 */
export interface TreatmentData {
  id: string;
  name: string;
  description?: string;
  total_cost: number;  // Auto-calculated: sum of (procedure.cost * procedure.quantity)
  procedure_count: number;  // Auto-calculated: count of procedures
  procedures: ProcedureData[];
  
  // Optional fields for consultation form
  createdAt?: string;  // ISO timestamp when treatment was added
  isIndividualProcedure?: boolean;  // Flag if this is a single procedure vs. grouped treatment
}

/**
 * Treatment Plan Structure
 * Container for all treatments in a plan
 */
export interface TreatmentPlanData {
  treatments: TreatmentData[];
}

/**
 * Full Treatment Plan Form Data
 * Used in treatment_plan_forms table
 */
export interface TreatmentPlanFormData {
  id?: string;
  patient_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  treatments: TreatmentData[];
  plan_date?: string;
  form_status?: 'draft' | 'completed';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Consultation Treatment Form Data
 * Used in consultations.treatment_plan JSONB field
 */
export interface ConsultationTreatmentFormData {
  clinicalAssessment: string;
  treatmentRecommendations: {
    archType: 'upper' | 'lower' | 'dual' | '';
    upperTreatment: string[];
    lowerTreatment: string[];
  };
  treatmentPlan: TreatmentPlanData;
  additionalInformation: string;
}

/**
 * Helper function to calculate treatment total cost
 * @param procedures - Array of procedures
 * @returns Total cost of all procedures
 */
export function calculateTreatmentTotalCost(procedures: ProcedureData[]): number {
  return procedures.reduce((sum, proc) => {
    const cost = parseFloat(proc.cost || '0');
    return sum + (cost * proc.quantity);
  }, 0);
}

/**
 * Helper function to create a new treatment object
 * @param id - Unique treatment ID
 * @param name - Treatment name
 * @param procedures - Array of procedures
 * @param description - Optional description
 * @returns New TreatmentData object
 */
export function createTreatment(
  id: string,
  name: string,
  procedures: ProcedureData[] = [],
  description?: string
): TreatmentData {
  return {
    id,
    name,
    description,
    procedures,
    total_cost: calculateTreatmentTotalCost(procedures),
    procedure_count: procedures.length,
    createdAt: new Date().toISOString()
  };
}

/**
 * Helper function to create a new procedure object
 * @param id - Unique procedure ID
 * @param name - Procedure name
 * @param cost - Unit cost
 * @param quantity - Quantity (default: 1)
 * @param cdtCode - Optional CDT code
 * @param cptCode - Optional CPT code
 * @returns New ProcedureData object
 */
export function createProcedure(
  id: string,
  name: string,
  cost: string = '0',
  quantity: number = 1,
  cdtCode?: string,
  cptCode?: string
): ProcedureData {
  return {
    id,
    name,
    cost,
    quantity,
    cdt_code: cdtCode,
    cpt_code: cptCode
  };
}

