import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
}

interface EditRoleDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdated: () => void;
}

export function EditRoleDialog({ role, open, onOpenChange, onRoleUpdated }: EditRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    description: ''
  });

  useEffect(() => {
    if (open && role) {
      setFormData({
        display_name: role.display_name || '',
        description: role.description || ''
      });
    }
  }, [open, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.display_name.trim()) {
      toast.error('Display name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('roles')
        .update({
          display_name: formData.display_name.trim(),
          description: formData.description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', role.id);

      if (error) {
        console.error('Error updating role:', error);
        toast.error('Failed to update role');
        return;
      }

      toast.success('Role updated successfully');
      onOpenChange(false);
      onRoleUpdated();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-indigo-600" />
            Edit Role
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role_name">Role Name (System)</Label>
            <Input
              id="role_name"
              value={role.name}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">System name cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Enter display name"
              required
            />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

