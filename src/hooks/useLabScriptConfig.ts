import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ConfigOption {
  id: string;
  name: string;
  value: string;
  is_active: boolean;
  display_order: number;
}

export function useLabScriptConfig() {
  const [treatmentTypes, setTreatmentTypes] = useState<ConfigOption[]>([]);
  const [applianceTypes, setApplianceTypes] = useState<ConfigOption[]>([]);
  const [materials, setMaterials] = useState<ConfigOption[]>([]);
  const [shades, setShades] = useState<ConfigOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all configuration data
  const fetchAllConfig = async () => {
    try {
      setLoading(true);

      const [treatmentTypesRes, applianceTypesRes, materialsRes, shadesRes] = await Promise.all([
        supabase.from('treatment_types').select('*').eq('is_active', true).order('display_order'),
        supabase.from('appliance_types').select('*').eq('is_active', true).order('display_order'),
        supabase.from('materials').select('*').eq('is_active', true).order('display_order'),
        supabase.from('shades').select('*').eq('is_active', true).order('display_order')
      ]);

      if (treatmentTypesRes.error) throw treatmentTypesRes.error;
      if (applianceTypesRes.error) throw applianceTypesRes.error;
      if (materialsRes.error) throw materialsRes.error;
      if (shadesRes.error) throw shadesRes.error;

      setTreatmentTypes(treatmentTypesRes.data || []);
      setApplianceTypes(applianceTypesRes.data || []);
      setMaterials(materialsRes.data || []);
      setShades(shadesRes.data || []);
    } catch (error) {
      console.error('Error fetching config:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllConfig();
  }, []);

  // Treatment Types CRUD
  const addTreatmentType = async (name: string, value: string) => {
    try {
      const maxOrder = Math.max(...treatmentTypes.map(t => t.display_order), 0);
      const { error } = await supabase
        .from('treatment_types')
        .insert({ name, value, display_order: maxOrder + 1 });

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Treatment type added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateTreatmentType = async (id: string, name: string, value: string) => {
    try {
      const { error } = await supabase
        .from('treatment_types')
        .update({ name, value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Treatment type updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteTreatmentType = async (id: string) => {
    try {
      const { error } = await supabase.from('treatment_types').delete().eq('id', id);
      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Treatment type deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  // Appliance Types CRUD
  const addApplianceType = async (name: string, value: string) => {
    try {
      const maxOrder = Math.max(...applianceTypes.map(t => t.display_order), 0);
      const { error } = await supabase
        .from('appliance_types')
        .insert({ name, value, display_order: maxOrder + 1 });

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Appliance type added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateApplianceType = async (id: string, name: string, value: string) => {
    try {
      const { error } = await supabase
        .from('appliance_types')
        .update({ name, value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Appliance type updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteApplianceType = async (id: string) => {
    try {
      const { error } = await supabase.from('appliance_types').delete().eq('id', id);
      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Appliance type deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  // Materials CRUD
  const addMaterial = async (name: string, value: string) => {
    try {
      const maxOrder = Math.max(...materials.map(t => t.display_order), 0);
      const { error } = await supabase
        .from('materials')
        .insert({ name, value, display_order: maxOrder + 1 });

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Material added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateMaterial = async (id: string, name: string, value: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ name, value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Material updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Material deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  // Shades CRUD
  const addShade = async (name: string, value: string) => {
    try {
      const maxOrder = Math.max(...shades.map(t => t.display_order), 0);
      const { error } = await supabase
        .from('shades')
        .insert({ name, value, display_order: maxOrder + 1 });

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Shade added" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const updateShade = async (id: string, name: string, value: string) => {
    try {
      const { error } = await supabase
        .from('shades')
        .update({ name, value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Shade updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteShade = async (id: string) => {
    try {
      const { error } = await supabase.from('shades').delete().eq('id', id);
      if (error) throw error;
      await fetchAllConfig();
      toast({ title: "Success", description: "Shade deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  return {
    treatmentTypes,
    applianceTypes,
    materials,
    shades,
    loading,
    fetchAllConfig,
    addTreatmentType,
    updateTreatmentType,
    deleteTreatmentType,
    addApplianceType,
    updateApplianceType,
    deleteApplianceType,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addShade,
    updateShade,
    deleteShade,
  };
}

