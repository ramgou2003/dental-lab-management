import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, Eye } from "lucide-react";

interface AirwayImageUploadProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const AirwayImageUpload = ({ formData, setFormData }: AirwayImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      console.log("Uploading airway evaluation image:", file.name);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${formData.patient_id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('airway_evaluation_images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log("Image uploaded successfully:", data);

      const { data: { publicUrl } } = supabase.storage
        .from('airway_evaluation_images')
        .getPublicUrl(filePath);

      setFormData({
        ...formData,
        airway_image_url: publicUrl
      });

      toast({
        title: "Success",
        description: "Airway evaluation image uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {!formData.airway_image_url ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('airway-image-upload')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Airway Evaluation Picture
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Airway Evaluation Picture
          </Button>
        )}
        <input
          id="airway-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          {formData.airway_image_url && (
            <img
              src={formData.airway_image_url}
              alt="Airway evaluation"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};