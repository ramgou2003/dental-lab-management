import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FieldVisibilityRule {
  id: string;
  field_name: string;
  rule_type: 'hide_when' | 'show_when';
  condition_field: 'treatment_type' | 'appliance_type';
  condition_values: string[];
  arch_type: string | null;
  is_active: boolean;
  display_order: number;
}

export function useFieldVisibilityRules() {
  const [rules, setRules] = useState<FieldVisibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('field_visibility_rules')
        .select('*')
        .eq('is_active', true)
        .order('field_name')
        .order('display_order');

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching field visibility rules:', error);
      toast({
        title: "Error",
        description: "Failed to load field visibility rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const addRule = async (ruleData: Omit<FieldVisibilityRule, 'id' | 'is_active' | 'display_order'>) => {
    try {
      const maxOrder = Math.max(...rules.filter(r => r.field_name === ruleData.field_name).map(r => r.display_order), 0);
      const { error } = await supabase
        .from('field_visibility_rules')
        .insert({ ...ruleData, display_order: maxOrder + 1 });

      if (error) throw error;
      await fetchRules();
      toast({ title: "Success", description: "Rule added successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateRule = async (id: string, ruleData: Partial<FieldVisibilityRule>) => {
    try {
      const { error } = await supabase
        .from('field_visibility_rules')
        .update({ ...ruleData, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchRules();
      toast({ title: "Success", description: "Rule updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('field_visibility_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRules();
      toast({ title: "Success", description: "Rule deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  // Helper function to evaluate if a field should be visible
  const shouldShowField = (
    fieldName: string,
    formData: {
      archType: string;
      upperTreatmentType?: string;
      lowerTreatmentType?: string;
      upperApplianceType?: string;
      lowerApplianceType?: string;
    }
  ): boolean => {
    const fieldRules = rules.filter(r => r.field_name === fieldName);
    if (fieldRules.length === 0) return true; // Show by default if no rules

    const { archType, upperTreatmentType, lowerTreatmentType, upperApplianceType, lowerApplianceType } = formData;

    // Helper to check if a rule matches for a specific arch
    const checkArchRule = (arch: 'upper' | 'lower', treatmentType?: string, applianceType?: string): boolean => {
      for (const rule of fieldRules) {
        // Skip if rule is for a different arch
        if (rule.arch_type && rule.arch_type !== arch) continue;

        const valueToCheck = rule.condition_field === 'treatment_type' ? treatmentType : applianceType;
        if (!valueToCheck) continue;

        const matches = rule.condition_values.includes(valueToCheck);

        if (rule.rule_type === 'hide_when' && matches) {
          return false; // Hide this field
        } else if (rule.rule_type === 'show_when' && !matches) {
          return false; // Don't show this field
        }
      }
      return true; // Show by default
    };

    if (archType === 'upper') {
      return checkArchRule('upper', upperTreatmentType, upperApplianceType);
    } else if (archType === 'lower') {
      return checkArchRule('lower', lowerTreatmentType, lowerApplianceType);
    } else if (archType === 'dual') {
      // For dual arch, show if at least one arch should show it
      const upperShow = checkArchRule('upper', upperTreatmentType, upperApplianceType);
      const lowerShow = checkArchRule('lower', lowerTreatmentType, lowerApplianceType);
      return upperShow || lowerShow;
    }

    return true; // Show by default
  };

  return {
    rules,
    loading,
    fetchRules,
    addRule,
    updateRule,
    deleteRule,
    shouldShowField,
  };
}

