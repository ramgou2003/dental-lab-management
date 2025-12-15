import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from "lucide-react";
import { useLabScriptConfig, ConfigOption } from "@/hooks/useLabScriptConfig";
import { useFieldVisibilityRules, FieldVisibilityRule } from "@/hooks/useFieldVisibilityRules";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LabScriptConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LabScriptConfigDialog({ open, onClose }: LabScriptConfigDialogProps) {
  const {
    treatmentTypes,
    applianceTypes,
    materials,
    shades,
    loading,
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
  } = useLabScriptConfig();

  const {
    rules,
    addRule,
    updateRule,
    deleteRule,
  } = useFieldVisibilityRules();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; type: string } | null>(null);

  // Helper function to generate value from display name
  const generateValue = (displayName: string): string => {
    return displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Rule management state
  const [newRuleField, setNewRuleField] = useState("");
  const [newRuleType, setNewRuleType] = useState<'hide_when' | 'show_when'>('hide_when');
  const [newRuleConditionField, setNewRuleConditionField] = useState<'treatment_type' | 'appliance_type'>('treatment_type');
  const [newRuleConditionValues, setNewRuleConditionValues] = useState<string[]>([]);
  const [newRuleConditionInput, setNewRuleConditionInput] = useState("");

  const handleEdit = (item: ConfigOption) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditValue(item.value);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditValue("");
  };

  const handleSaveEdit = async (type: 'treatment' | 'appliance' | 'material' | 'shade') => {
    if (!editingId || !editName.trim()) return;

    // Auto-generate value from display name
    const autoValue = generateValue(editName);

    try {
      if (type === 'treatment') await updateTreatmentType(editingId, editName, autoValue);
      else if (type === 'appliance') await updateApplianceType(editingId, editName, autoValue);
      else if (type === 'material') await updateMaterial(editingId, editName, autoValue);
      else if (type === 'shade') await updateShade(editingId, editName, autoValue);
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleAdd = async (type: 'treatment' | 'appliance' | 'material' | 'shade') => {
    if (!newName.trim()) return;

    // Auto-generate value from display name
    const autoValue = generateValue(newName);

    try {
      if (type === 'treatment') await addTreatmentType(newName, autoValue);
      else if (type === 'appliance') await addApplianceType(newName, autoValue);
      else if (type === 'material') await addMaterial(newName, autoValue);
      else if (type === 'shade') await addShade(newName, autoValue);
      setNewName("");
    } catch (error) {
      console.error('Error adding:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'treatment') await deleteTreatmentType(deleteConfirm.id);
      else if (deleteConfirm.type === 'appliance') await deleteApplianceType(deleteConfirm.id);
      else if (deleteConfirm.type === 'material') await deleteMaterial(deleteConfirm.id);
      else if (deleteConfirm.type === 'shade') await deleteShade(deleteConfirm.id);
      else if (deleteConfirm.type === 'rule') await deleteRule(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const renderConfigList = (
    items: ConfigOption[],
    type: 'treatment' | 'appliance' | 'material' | 'shade',
    title: string
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      
      {/* Add New Item */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <Label className="text-sm font-medium mb-2 block">Add New {title.slice(0, -1)}</Label>
        <div className="space-y-2 mb-2">
          <div>
            <Input
              placeholder="Display Name (e.g., Full Arch Fixed)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            {newName && (
              <p className="text-xs text-gray-500 mt-1">
                Value will be: <span className="font-mono text-blue-600">{generateValue(newName)}</span>
              </p>
            )}
          </div>
        </div>
        <Button
          onClick={() => handleAdd(type)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!newName.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* List Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-3 bg-white">
            {editingId === item.id ? (
              <div className="space-y-2">
                <div>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Display Name"
                  />
                  {editName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Value will be: <span className="font-mono text-blue-600">{generateValue(editName)}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSaveEdit(type)} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancelEdit} size="sm" variant="outline">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.value}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(item)} size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirm({ id: item.id, name: item.name, type })}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleAddRule = async () => {
    if (!newRuleField || newRuleConditionValues.length === 0) return;

    try {
      await addRule({
        field_name: newRuleField,
        rule_type: newRuleType,
        condition_field: newRuleConditionField,
        condition_values: newRuleConditionValues,
        arch_type: null,
      });
      setNewRuleField("");
      setNewRuleConditionValues([]);
      setNewRuleConditionInput("");
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const handleAddConditionValue = () => {
    if (!newRuleConditionInput.trim()) return;
    setNewRuleConditionValues([...newRuleConditionValues, newRuleConditionInput.trim()]);
    setNewRuleConditionInput("");
  };

  const handleRemoveConditionValue = (value: string) => {
    setNewRuleConditionValues(newRuleConditionValues.filter(v => v !== value));
  };

  const renderVisibilityRules = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Field Visibility Rules</h3>
      <p className="text-sm text-gray-600">
        Configure when fields should be hidden or shown based on treatment type or appliance type selections.
      </p>

      {/* Add New Rule */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <Label className="text-sm font-medium mb-2 block">Add New Visibility Rule</Label>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Field Name</Label>
              <Select value={newRuleField} onValueChange={setNewRuleField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screw_type">Screw Type</SelectItem>
                  <SelectItem value="vdo_details">VDO Details</SelectItem>
                  <SelectItem value="nightguard_question">Nightguard Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Rule Type</Label>
              <Select value={newRuleType} onValueChange={(v) => setNewRuleType(v as 'hide_when' | 'show_when')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hide_when">Hide When</SelectItem>
                  <SelectItem value="show_when">Show When</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Condition Field</Label>
            <Select value={newRuleConditionField} onValueChange={(v) => setNewRuleConditionField(v as 'treatment_type' | 'appliance_type')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="treatment_type">Treatment Type</SelectItem>
                <SelectItem value="appliance_type">Appliance Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Condition Values (e.g., denture, nightguard)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter value and press Add"
                value={newRuleConditionInput}
                onChange={(e) => setNewRuleConditionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddConditionValue())}
              />
              <Button type="button" onClick={handleAddConditionValue} size="sm">Add</Button>
            </div>
            {newRuleConditionValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newRuleConditionValues.map((value) => (
                  <span key={value} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                    {value}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveConditionValue(value)} />
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={handleAddRule}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!newRuleField || newRuleConditionValues.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* List Rules */}
      <div className="space-y-2">
        {Object.entries(
          rules.reduce((acc, rule) => {
            if (!acc[rule.field_name]) acc[rule.field_name] = [];
            acc[rule.field_name].push(rule);
            return acc;
          }, {} as Record<string, FieldVisibilityRule[]>)
        ).map(([fieldName, fieldRules]) => (
          <div key={fieldName} className="border rounded-lg p-3 bg-white">
            <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </div>
            <div className="space-y-2 ml-6">
              {fieldRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <div>
                    <span className="font-medium">{rule.rule_type === 'hide_when' ? 'Hide' : 'Show'}</span>
                    {' when '}
                    <span className="font-medium">{rule.condition_field.replace('_', ' ')}</span>
                    {' is: '}
                    <span className="text-blue-600">{rule.condition_values.join(', ')}</span>
                  </div>
                  <Button
                    onClick={() => setDeleteConfirm({ id: rule.id, name: `${fieldName} rule`, type: 'rule' })}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5 text-blue-600" />
              Lab Script Configuration
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="treatment" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="treatment">Treatment Types</TabsTrigger>
              <TabsTrigger value="appliance">Appliance Types</TabsTrigger>
              <TabsTrigger value="material">Materials</TabsTrigger>
              <TabsTrigger value="shade">Shades</TabsTrigger>
              <TabsTrigger value="rules">Visibility Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="treatment" className="mt-4">
              {renderConfigList(treatmentTypes, 'treatment', 'Treatment Types')}
            </TabsContent>

            <TabsContent value="appliance" className="mt-4">
              {renderConfigList(applianceTypes, 'appliance', 'Appliance Types')}
            </TabsContent>

            <TabsContent value="material" className="mt-4">
              {renderConfigList(materials, 'material', 'Materials')}
            </TabsContent>

            <TabsContent value="shade" className="mt-4">
              {renderConfigList(shades, 'shade', 'Shades')}
            </TabsContent>

            <TabsContent value="rules" className="mt-4">
              {renderVisibilityRules()}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirm?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

