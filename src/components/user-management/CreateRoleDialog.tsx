import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated: () => void;
}

export function CreateRoleDialog({ open, onOpenChange, onRoleCreated }: CreateRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: ''
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  // Generate system name from display name
  const generateSystemName = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  };

  const handleDisplayNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      display_name: value,
      name: generateSystemName(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.display_name.trim()) {
      toast.error('Role name and display name are required');
      return;
    }

    // Validate system name format
    if (!/^[a-z][a-z0-9_]*$/.test(formData.name)) {
      toast.error('System name must start with a letter and contain only lowercase letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('roles')
        .insert({
          name: formData.name.trim(),
          display_name: formData.display_name.trim(),
          description: formData.description.trim() || null,
          is_system_role: false,
          status: 'active'
        });

      if (error) {
        console.error('Error creating role:', error);
        if (error.code === '23505') {
          toast.error('A role with this name already exists');
        } else {
          toast.error('Failed to create role');
        }
        return;
      }

      toast.success('Role created successfully');
      handleClose(false);
      onRoleCreated();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-indigo-600" />
            Create New Role
          </DialogTitle>
          <DialogDescription>
            Create a new role to assign permissions to users
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              placeholder="e.g., Lab Technician"
              required
            />
          </div>

          <div>
            <Label htmlFor="name">System Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              placeholder="e.g., lab_technician"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-generated from display name. Only lowercase letters, numbers, and underscores allowed.
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter role description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Role
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

