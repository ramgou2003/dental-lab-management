import { DialogTitle, Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, User, Calendar, Check, Plus, Camera, X, Eye, Crop, RotateCcw, Move, ZoomIn, ZoomOut, RotateCw, Edit, Trash2 } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { saveSurgicalRecallSheet, updateSurgicalRecallSheet, SavedImplant, uploadImage, deleteImage, listStorageFiles, checkFileExists, testDeleteSpecificFiles, deleteSurgicalRecallSheet, testDeleteSurgicalRecallSheet } from "@/lib/surgicalRecallService";
import { toast } from "sonner";

interface SurgicalRecallSheetFormProps {
  patientId: string;
  patientName: string;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  editingSheet?: any;
}

export function SurgicalRecallSheetForm({
  patientId,
  patientName,
  onSubmit,
  onCancel,
  editingSheet
}: SurgicalRecallSheetFormProps) {
  // Debug logging
  console.log('🔍 SurgicalRecallSheetForm props:', {
    patientId,
    patientName,
    editingSheet: editingSheet ? {
      id: editingSheet.id,
      surgery_date: editingSheet.surgery_date,
      arch_type: editingSheet.arch_type,
      implants: editingSheet.surgical_recall_implants?.length || 0
    } : null
  });

  const [formData, setFormData] = useState({
    patient_name: patientName,
    surgery_date: editingSheet?.surgery_date || new Date().toISOString().split('T')[0],
    arch_type: editingSheet?.arch_type || '',
    upper_surgery_type: editingSheet?.upper_surgery_type || '',
    lower_surgery_type: editingSheet?.lower_surgery_type || '',
    upper_implant_count: editingSheet?.upper_implant_count || '',
    upper_implant_positions: editingSheet?.upper_implant_positions || '',
    upper_implant_brand: editingSheet?.upper_implant_brand || '',
    upper_implant_size: editingSheet?.upper_implant_size || '',
    upper_complications: editingSheet?.upper_complications || '',
    upper_notes: editingSheet?.upper_notes || '',
    lower_implant_count: editingSheet?.lower_implant_count || '',
    lower_implant_positions: editingSheet?.lower_implant_positions || '',
    lower_implant_brand: editingSheet?.lower_implant_brand || '',
    lower_implant_size: editingSheet?.lower_implant_size || '',
    lower_complications: editingSheet?.lower_complications || '',
    lower_notes: editingSheet?.lower_notes || '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showImplantDialog, setShowImplantDialog] = useState(false);
  const [implantDialogType, setImplantDialogType] = useState<'upper' | 'lower'>('upper');
  const [editingImplant, setEditingImplant] = useState<SavedImplant | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [implantToDelete, setImplantToDelete] = useState<SavedImplant | null>(null);
  const [implantData, setImplantData] = useState({
    position: '',
    mua_brand: '',
    mua_subtype: '',
    mua_size: '',
    mua_picture: null as File | null,
    brand: '',
    subtype: '',
    size: '',
    implant_picture: null as File | null
  });

  // File input refs for custom capture buttons
  const implantPictureInputRef = useRef<HTMLInputElement>(null);
  const muaPictureInputRef = useRef<HTMLInputElement>(null);

  // Image preview state
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    name: string;
    type: 'implant' | 'mua';
  } | null>(null);

  // Sticker image preview state
  const [stickerPreview, setStickerPreview] = useState<{
    url: string;
    title: string;
    type: 'implant' | 'mua';
  } | null>(null);

  // Store preview URLs to avoid recreating them on each render
  const [implantPreviewUrl, setImplantPreviewUrl] = useState<string | null>(null);
  const [muaPreviewUrl, setMuaPreviewUrl] = useState<string | null>(null);

  // Store saved implants
  const [savedImplants, setSavedImplants] = useState<{
    upper: Array<SavedImplant>;
    lower: Array<SavedImplant>;
  }>({
    upper: [],
    lower: []
  });

  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingImplant, setIsSavingImplant] = useState(false);

  // Make test function available globally for debugging
  useEffect(() => {
    (window as any).testDeleteSpecificFiles = testDeleteSpecificFiles;
    (window as any).testDeleteSurgicalRecallSheet = testDeleteSurgicalRecallSheet;
    (window as any).listStorageFiles = listStorageFiles;
    console.log('🧪 Debug functions available:');
    console.log('  - window.testDeleteSpecificFiles() - Test deleting specific image URLs');
    console.log('  - window.testDeleteSurgicalRecallSheet(sheetId) - Test deleting entire sheet');
    console.log('  - window.listStorageFiles() - List all files in storage');
  }, []);

  // Load existing data when editing
  useEffect(() => {
    if (editingSheet) {
      console.log('📝 Loading editing sheet data:', editingSheet);
      console.log('📋 Available fields:', Object.keys(editingSheet));
      console.log('📅 Surgery date:', editingSheet.surgery_date);
      console.log('🦷 Arch type:', editingSheet.arch_type);
      console.log('🔧 Upper surgery type:', editingSheet.upper_surgery_type);
      console.log('🔧 Lower surgery type:', editingSheet.lower_surgery_type);

      // Update form data with existing sheet data
      const newFormData = {
        patient_name: patientName,
        surgery_date: editingSheet.surgery_date || new Date().toISOString().split('T')[0],
        arch_type: editingSheet.arch_type || '',
        upper_surgery_type: editingSheet.upper_surgery_type || '',
        lower_surgery_type: editingSheet.lower_surgery_type || '',
        upper_implant_count: editingSheet.upper_implant_count || '',
        upper_implant_positions: editingSheet.upper_implant_positions || '',
        upper_implant_brand: editingSheet.upper_implant_brand || '',
        upper_implant_size: editingSheet.upper_implant_size || '',
        upper_complications: editingSheet.upper_complications || '',
        upper_notes: editingSheet.upper_notes || '',
        lower_implant_count: editingSheet.lower_implant_count || '',
        lower_implant_positions: editingSheet.lower_implant_positions || '',
        lower_implant_brand: editingSheet.lower_implant_brand || '',
        lower_implant_size: editingSheet.lower_implant_size || '',
        lower_complications: editingSheet.lower_complications || '',
        lower_notes: editingSheet.lower_notes || '',
      };

      console.log('📝 Setting form data:', newFormData);
      setFormData(newFormData);

      // Load existing implants
      if (editingSheet.surgical_recall_implants) {
        const upperImplants: SavedImplant[] = [];
        const lowerImplants: SavedImplant[] = [];

        editingSheet.surgical_recall_implants.forEach((implant: any) => {
          const savedImplant: SavedImplant = {
            id: implant.id,
            position: implant.position,
            implant_brand: implant.implant_brand,
            implant_subtype: implant.implant_subtype,
            implant_size: implant.implant_size,
            implant_picture_url: implant.implant_picture_url,
            mua_brand: implant.mua_brand,
            mua_subtype: implant.mua_subtype,
            mua_size: implant.mua_size,
            mua_picture_url: implant.mua_picture_url,
            arch_type: implant.arch_type
          };

          if (implant.arch_type === 'upper') {
            upperImplants.push(savedImplant);
          } else {
            lowerImplants.push(savedImplant);
          }
        });

        setSavedImplants({
          upper: upperImplants,
          lower: lowerImplants
        });

        console.log('📋 Loaded implants:', { upper: upperImplants.length, lower: lowerImplants.length });
      }
    } else {
      // Reset form when not editing
      setFormData({
        patient_name: patientName,
        surgery_date: new Date().toISOString().split('T')[0],
        arch_type: '',
        upper_surgery_type: '',
        lower_surgery_type: '',
        upper_implant_count: '',
        upper_implant_positions: '',
        upper_implant_brand: '',
        upper_implant_size: '',
        upper_complications: '',
        upper_notes: '',
        lower_implant_count: '',
        lower_implant_positions: '',
        lower_implant_brand: '',
        lower_implant_size: '',
        lower_complications: '',
        lower_notes: '',
      });

      setSavedImplants({
        upper: [],
        lower: []
      });
    }
  }, [editingSheet, patientName]);

  // Advanced cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total steps and step names based on arch type
  const getTotalSteps = () => {
    if (!formData.arch_type) return 1; // Only Basic Info
    if (formData.arch_type === 'dual') return 3; // Basic Info + Upper Implants + Lower Implants
    return 2; // Basic Info + Single arch (Upper or Lower Implants)
  };

  const getStepName = (stepNumber: number) => {
    if (stepNumber === 1) return 'Basic Info';
    if (formData.arch_type === 'dual') {
      if (stepNumber === 2) return 'Upper Implants';
      if (stepNumber === 3) return 'Lower Implants';
    } else if (formData.arch_type === 'upper') {
      if (stepNumber === 2) return 'Upper Implants';
    } else if (formData.arch_type === 'lower') {
      if (stepNumber === 2) return 'Lower Implants';
    }
    return '';
  };

  const totalSteps = getTotalSteps();

  // Step completion validation
  const isStep1Complete = () => {
    const hasBasicInfo = formData.surgery_date && formData.arch_type;
    if (!hasBasicInfo) return false;

    // Check surgery type based on arch type
    if (formData.arch_type === 'upper') {
      return formData.upper_surgery_type !== '';
    } else if (formData.arch_type === 'lower') {
      return formData.lower_surgery_type !== '';
    } else if (formData.arch_type === 'dual') {
      return formData.upper_surgery_type !== '' && formData.lower_surgery_type !== '';
    }
    return false;
  };

  const isStep2Complete = () => {
    // For now, we'll consider step 2 complete if arch type is selected
    // Later you can add specific validation for implant fields
    return formData.arch_type !== '';
  };

  const isStep3Complete = () => {
    // For dual arch, step 3 is for lower implants
    // For now, we'll consider it complete if we're on dual arch
    return formData.arch_type === 'dual';
  };

  const isStepComplete = (stepNumber: number) => {
    if (stepNumber === 1) return isStep1Complete();
    if (stepNumber === 2) return isStep2Complete();
    if (stepNumber === 3) return isStep3Complete();
    return false;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset to step 1 if arch type changes
    if (field === 'arch_type') {
      setCurrentStep(1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('🚀 Starting form submission with image uploads...');

      // Prepare sheet data
      const sheetData = {
        patient_id: patientId,
        patient_name: patientName,
        surgery_date: formData.surgery_date,
        arch_type: formData.arch_type as 'upper' | 'lower' | 'dual',
        upper_surgery_type: formData.upper_surgery_type || undefined,
        lower_surgery_type: formData.lower_surgery_type || undefined,
        status: 'completed' as const
      };

      // ✅ Upload images for all implants that have File objects
      const allImplants: SavedImplant[] = [
        ...savedImplants.upper,
        ...savedImplants.lower
      ];

      console.log('📸 Processing images for', allImplants.length, 'implants...');

      // Process each implant and upload images if needed
      const processedImplants: SavedImplant[] = [];

      for (const implant of allImplants) {
        console.log('🔄 Processing implant:', implant.id);

        let implantPictureUrl = implant.implant_picture_url;
        let muaPictureUrl = implant.mua_picture_url;

        // Upload implant picture if it's a File object (new/changed image)
        if (implant.implant_picture instanceof File) {
          console.log('📤 Uploading implant image for:', implant.id);
          try {
            implantPictureUrl = await uploadImage(
              implant.implant_picture,
              `implants/${implant.id}`
            );
            console.log('✅ Implant image uploaded:', implantPictureUrl);
          } catch (error) {
            console.error('❌ Failed to upload implant image:', error);
            throw new Error('Failed to upload implant image');
          }
        }

        // Upload MUA picture if it's a File object (new/changed image)
        if (implant.mua_picture instanceof File) {
          console.log('📤 Uploading MUA image for:', implant.id);
          try {
            muaPictureUrl = await uploadImage(
              implant.mua_picture,
              `mua/${implant.id}`
            );
            console.log('✅ MUA image uploaded:', muaPictureUrl);
          } catch (error) {
            console.error('❌ Failed to upload MUA image:', error);
            throw new Error('Failed to upload MUA image');
          }
        }

        // Create processed implant with final URLs
        processedImplants.push({
          ...implant,
          implant_picture_url: implantPictureUrl,
          mua_picture_url: muaPictureUrl,
          // Remove File objects before saving to database
          implant_picture: undefined,
          mua_picture: undefined
        });
      }

      console.log('💾 Saving to database with', processedImplants.length, 'processed implants...');

      // Save to database with processed implants
      const result = editingSheet
        ? await updateSurgicalRecallSheet(editingSheet.id, sheetData, processedImplants)
        : await saveSurgicalRecallSheet(sheetData, processedImplants);

      if (result.success) {
        toast.success(
          editingSheet
            ? 'Surgical recall sheet updated successfully!'
            : 'Surgical recall sheet saved successfully!'
        );
        onSubmit(result.data);
      } else {
        toast.error(`Failed to save: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An unexpected error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddImplant = (type: 'upper' | 'lower') => {
    setImplantDialogType(type);
    setEditingImplant(null);
    setImplantData({
      position: '',
      mua_brand: '',
      mua_subtype: '',
      mua_size: '',
      mua_picture: null,
      brand: '',
      subtype: '',
      size: '',
      implant_picture: null
    });
    setImplantPreviewUrl(null);
    setMuaPreviewUrl(null);
    setShowImplantDialog(true);
  };

  const handleEditImplant = async (implant: SavedImplant) => {
    setEditingImplant(implant);
    setImplantDialogType(implant.arch_type);

    // Load existing images as File objects if they exist
    let implantFile: File | null = null;
    let muaFile: File | null = null;

    try {
      // Convert existing image URLs to File objects for editing
      if (implant.implant_picture_url) {
        console.log('Loading existing implant image:', implant.implant_picture_url);
        const response = await fetch(implant.implant_picture_url);
        const blob = await response.blob();
        implantFile = new File([blob], 'existing-implant-image.jpg', { type: blob.type });
        console.log('Loaded implant image as File:', implantFile);
      }

      if (implant.mua_picture_url) {
        console.log('Loading existing MUA image:', implant.mua_picture_url);
        const response = await fetch(implant.mua_picture_url);
        const blob = await response.blob();
        muaFile = new File([blob], 'existing-mua-image.jpg', { type: blob.type });
        console.log('Loaded MUA image as File:', muaFile);
      }
    } catch (error) {
      console.error('Error loading existing images:', error);
      // Continue without the images if loading fails
    }

    setImplantData({
      position: implant.position,
      mua_brand: implant.mua_brand || '',
      mua_subtype: implant.mua_subtype || '',
      mua_size: implant.mua_size || '',
      mua_picture: muaFile,
      brand: implant.implant_brand || '',
      subtype: implant.implant_subtype || '',
      size: implant.implant_size || '',
      implant_picture: implantFile
    });

    // Set preview URLs from existing images
    setImplantPreviewUrl(implant.implant_picture_url || null);
    setMuaPreviewUrl(implant.mua_picture_url || null);

    setShowImplantDialog(true);
  };

  const handleDeleteImplant = (implant: SavedImplant) => {
    setImplantToDelete(implant);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteImplant = async () => {
    if (!implantToDelete) return;

    try {
      console.log('🗑️ Deleting implant:', implantToDelete);

      // List files before deletion
      console.log('📋 Listing files before deletion:');
      await listStorageFiles();

      // Delete images from storage if they exist
      const deletePromises = [];

      if (implantToDelete.implant_picture_url) {
        console.log('🗑️ Deleting implant image:', implantToDelete.implant_picture_url);
        deletePromises.push(deleteImage(implantToDelete.implant_picture_url));
      }

      if (implantToDelete.mua_picture_url) {
        console.log('🗑️ Deleting MUA image:', implantToDelete.mua_picture_url);
        deletePromises.push(deleteImage(implantToDelete.mua_picture_url));
      }

      // Wait for all deletions to complete
      const deleteResults = await Promise.all(deletePromises);
      console.log('📊 Image deletion results:', deleteResults);

      // List files after deletion
      console.log('📋 Listing files after deletion:');
      await listStorageFiles();

      // Remove from saved implants
      setSavedImplants(prev => ({
        ...prev,
        [implantToDelete.arch_type]: prev[implantToDelete.arch_type].filter(item => item.id !== implantToDelete.id)
      }));

      // Close dialog and reset state
      setShowDeleteConfirm(false);
      setImplantToDelete(null);

      toast.success('Implant and images deleted successfully');
    } catch (error) {
      console.error('Error deleting implant:', error);
      toast.error('Failed to delete implant. Please try again.');
    }
  };

  const cancelDeleteImplant = () => {
    setShowDeleteConfirm(false);
    setImplantToDelete(null);
  };

  // Handle sticker image preview
  const handleStickerPreview = (url: string, implant: SavedImplant, type: 'implant' | 'mua') => {
    const title = `${type === 'implant' ? 'Implant' : 'MUA'} Sticker - Tooth ${implant.position}`;
    setStickerPreview({
      url,
      title,
      type
    });
  };

  const closeStickerPreview = () => {
    setStickerPreview(null);
  };

  const handleImplantDataChange = (field: string, value: string) => {
    setImplantData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setImplantData(prev => ({
      ...prev,
      [field]: file
    }));

    // Create preview URL and show preview dialog
    if (file) {
      const url = URL.createObjectURL(file);

      // Store the preview URL for the specific field
      if (field === 'implant_picture') {
        // Clean up previous URL if exists
        if (implantPreviewUrl) {
          URL.revokeObjectURL(implantPreviewUrl);
        }
        setImplantPreviewUrl(url);
      } else if (field === 'mua_picture') {
        // Clean up previous URL if exists
        if (muaPreviewUrl) {
          URL.revokeObjectURL(muaPreviewUrl);
        }
        setMuaPreviewUrl(url);
      }

      setPreviewImage({
        url,
        name: file.name,
        type: field === 'implant_picture' ? 'implant' : 'mua'
      });
    }
  };

  const closePreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage.url);
      setPreviewImage(null);
    }
    resetCropState();
  };

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      if (implantPreviewUrl) {
        URL.revokeObjectURL(implantPreviewUrl);
      }
      if (muaPreviewUrl) {
        URL.revokeObjectURL(muaPreviewUrl);
      }
    };
  }, [implantPreviewUrl, muaPreviewUrl]);

  const resetCropState = () => {
    setIsCropping(false);
    setCropArea(null);
    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(null);
    setZoom(1);
    setRotation(0);
  };

  const startCropping = () => {
    setIsCropping(true);
    // Set initial crop area to center 80% of image
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const margin = 0.1;
      setCropArea({
        x: rect.width * margin,
        y: rect.height * margin,
        width: rect.width * (1 - 2 * margin),
        height: rect.height * (1 - 2 * margin)
      });
    }
  };



  // Touch and mouse event handlers
  const getEventPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const rect = cropContainerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handlePointerDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isCropping) return;
    e.preventDefault();

    const pos = getEventPosition(e);

    if (!cropArea) {
      // Start drawing new crop area
      setIsDrawing(true);
      setCropArea({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0
      });
    } else {
      // Check if clicking on resize handles or inside crop area
      const handleSize = 20;
      const isOnRightEdge = Math.abs(pos.x - (cropArea.x + cropArea.width)) < handleSize;
      const isOnBottomEdge = Math.abs(pos.y - (cropArea.y + cropArea.height)) < handleSize;
      const isOnLeftEdge = Math.abs(pos.x - cropArea.x) < handleSize;
      const isOnTopEdge = Math.abs(pos.y - cropArea.y) < handleSize;

      if (isOnRightEdge && isOnBottomEdge) {
        setIsResizing('se');
      } else if (isOnRightEdge) {
        setIsResizing('e');
      } else if (isOnBottomEdge) {
        setIsResizing('s');
      } else if (pos.x >= cropArea.x && pos.x <= cropArea.x + cropArea.width &&
                 pos.y >= cropArea.y && pos.y <= cropArea.y + cropArea.height) {
        setIsDragging(true);
        setDragStart({ x: pos.x - cropArea.x, y: pos.y - cropArea.y });
      }
    }
  }, [isCropping, cropArea]);

  const handlePointerMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isCropping) return;
    e.preventDefault();

    const pos = getEventPosition(e);

    if (isDrawing && cropArea) {
      setCropArea(prev => prev ? {
        ...prev,
        width: Math.max(0, pos.x - prev.x),
        height: Math.max(0, pos.y - prev.y)
      } : null);
    } else if (isDragging && cropArea) {
      const newX = pos.x - dragStart.x;
      const newY = pos.y - dragStart.y;
      setCropArea(prev => prev ? {
        ...prev,
        x: Math.max(0, newX),
        y: Math.max(0, newY)
      } : null);
    } else if (isResizing && cropArea) {
      setCropArea(prev => {
        if (!prev) return null;
        const newArea = { ...prev };

        if (isResizing.includes('e')) {
          newArea.width = Math.max(50, pos.x - prev.x);
        }
        if (isResizing.includes('s')) {
          newArea.height = Math.max(50, pos.y - prev.y);
        }

        return newArea;
      });
    }
  }, [isCropping, isDrawing, isDragging, isResizing, cropArea, dragStart]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  const applyCrop = useCallback(() => {
    if (!cropArea || !imageRef.current || !canvasRef.current || !previewImage) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scale factors
    const scaleX = img.naturalWidth / img.offsetWidth;
    const scaleY = img.naturalHeight / img.offsetHeight;

    // Calculate crop coordinates relative to the actual image
    const cropX = cropArea.x * scaleX;
    const cropY = cropArea.y * scaleY;
    const cropWidth = cropArea.width * scaleX;
    const cropHeight = cropArea.height * scaleY;

    // Set canvas size to crop dimensions
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Apply rotation if any
    if (rotation !== 0) {
      ctx.translate(cropWidth / 2, cropHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-cropWidth / 2, -cropHeight / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    // Convert to blob and update the file
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], previewImage.name, { type: 'image/jpeg' });

        // Create new URL for the cropped image
        const newUrl = URL.createObjectURL(blob);

        // Update the implant data with the cropped file
        setImplantData(prev => ({
          ...prev,
          [previewImage.type === 'implant' ? 'implant_picture' : 'mua_picture']: croppedFile
        }));

        // Update the appropriate preview URL
        if (previewImage.type === 'implant') {
          if (implantPreviewUrl) {
            URL.revokeObjectURL(implantPreviewUrl);
          }
          setImplantPreviewUrl(newUrl);
        } else {
          if (muaPreviewUrl) {
            URL.revokeObjectURL(muaPreviewUrl);
          }
          setMuaPreviewUrl(newUrl);
        }

        // Update preview dialog
        URL.revokeObjectURL(previewImage.url);
        setPreviewImage({
          ...previewImage,
          url: newUrl
        });

        resetCropState();
      }
    }, 'image/jpeg', 0.95);
  }, [cropArea, previewImage, rotation, handleFileChange]);

  const handleSaveImplant = async () => {
    // Validate required fields
    if (!implantData.position) {
      alert('Please select an implant position');
      return;
    }

    try {
      // Show loading state
      setIsSavingImplant(true);

      const implantId = editingImplant ? editingImplant.id : Date.now().toString();

      // ✅ DON'T upload images here - just store them locally for form submission
      // Keep existing URLs if editing, or use preview URLs for new images
      let implantPictureUrl = editingImplant?.implant_picture_url || implantPreviewUrl;
      let muaPictureUrl = editingImplant?.mua_picture_url || muaPreviewUrl;

      console.log('💾 Saving implant locally (images will be uploaded on form submission)');
      console.log('📸 Implant image:', implantData.implant_picture ? 'File ready for upload' : 'No new image');
      console.log('📸 MUA image:', implantData.mua_picture ? 'File ready for upload' : 'No new image');

      // Create implant object with uploaded image URLs
      const implantObject: SavedImplant = {
        id: implantId,
        position: implantData.position,
        implant_brand: implantData.brand,
        implant_subtype: implantData.subtype,
        implant_size: implantData.size,
        implant_picture: implantData.implant_picture,
        implant_picture_url: implantPictureUrl || (implantPreviewUrl || (implantData.implant_picture ? URL.createObjectURL(implantData.implant_picture) : null)),
        mua_brand: implantData.mua_brand,
        mua_subtype: implantData.mua_subtype,
        mua_size: implantData.mua_size,
        mua_picture: implantData.mua_picture,
        mua_picture_url: muaPictureUrl || (muaPreviewUrl || (implantData.mua_picture ? URL.createObjectURL(implantData.mua_picture) : null)),
        arch_type: implantDialogType
      };

      if (editingImplant) {
        // Update existing implant
        setSavedImplants(prev => ({
          ...prev,
          [implantDialogType!]: prev[implantDialogType!].map(item =>
            item.id === editingImplant.id ? implantObject : item
          )
        }));
        toast.success('Implant updated successfully!');
      } else {
        // Add new implant
        setSavedImplants(prev => ({
          ...prev,
          [implantDialogType!]: [...prev[implantDialogType!], implantObject]
        }));
        toast.success('Implant added successfully!');
      }

      // Reset form and close dialog
      setImplantData({
        position: '',
        mua_brand: '',
        mua_subtype: '',
        mua_size: '',
        mua_picture: null,
        brand: '',
        subtype: '',
        size: '',
        implant_picture: null
      });
      setImplantPreviewUrl(null);
      setMuaPreviewUrl(null);
      setShowImplantDialog(false);

      // Show success message
      console.log('✅ Implant saved locally (images will be uploaded on form submission)');
      toast.success(editingImplant ? 'Implant updated successfully!' : 'Implant added successfully!');

    } catch (error) {
      console.error('Error saving implant:', error);
      toast.error('Failed to save implant. Please try again.');
    } finally {
      setIsSavingImplant(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-3 relative">
        <div className="flex items-center justify-between pr-12">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Activity className="h-5 w-5 text-blue-600" />
            {editingSheet ? 'Edit' : 'Add'} Surgical Recall Sheet - Step {currentStep} of {totalSteps}
          </DialogTitle>
        </div>
      </div>

      {/* Step Progress Indicator - Horizontal like IV Sedation */}
      <div className="flex-shrink-0 px-6 pt-6 pb-6">
        <div className="flex items-center justify-between w-full gap-4">
          {/* Step 1: Basic Info - Always visible */}
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2 pb-2">
              <div className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Basic Info
              </div>
              {isStep1Complete() && (
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className={`h-1 w-full rounded-full ${currentStep === 1 ? 'bg-blue-600' : currentStep > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          </div>

          {/* Step 2: Dynamic based on arch type */}
          {formData.arch_type && (
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2 pb-2">
                <div className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : currentStep > 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {formData.arch_type === 'upper' ? 'Upper Implants' :
                   formData.arch_type === 'lower' ? 'Lower Implants' : 'Upper Implants'}
                </div>
                {isStep2Complete() && currentStep > 2 && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className={`h-1 w-full rounded-full ${currentStep === 2 ? 'bg-blue-600' : currentStep > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          )}

          {/* Step 3: Lower Implants - Only for dual arch */}
          {formData.arch_type === 'dual' && (
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center gap-2 pb-2">
                <div className={`text-sm font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  Lower Implants
                </div>
                {isStep3Complete() && currentStep > 3 && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className={`h-1 w-full rounded-full ${currentStep === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          )}
        </div>
      </div>

      {/* Form Content - exactly like IV sedation structure */}
      <div className="flex-1 flex flex-col min-h-0">
        <form
          className="flex-1 flex flex-col min-h-0"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {/* Step Content Container - Hidden Scrollbar */}
          <div className="flex-1 px-6 py-2 overflow-y-auto scrollbar-hidden">


            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Patient Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-600" />
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="patient_name" className="text-sm font-medium text-gray-700">
                        Patient Name
                      </Label>
                      <Input
                        id="patient_name"
                        value={formData.patient_name}
                        disabled
                        className="bg-gray-50 border-gray-200 text-gray-600"
                      />
                      <p className="text-xs text-gray-500">Automatically filled from patient selection</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surgery_date" className="text-sm font-medium text-gray-700">
                        Surgery Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="surgery_date"
                        type="date"
                        value={formData.surgery_date}
                        onChange={(e) => handleInputChange('surgery_date', e.target.value)}
                        required
                        className="bg-white border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500">Select the date when the surgery was performed</p>
                    </div>
                  </div>
                </div>

                {/* Arch Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Arch Type <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('arch_type', 'upper')}
                      className={`px-4 py-3 rounded-lg border-2 text-center transition-all duration-200 ${
                        formData.arch_type === 'upper'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">Upper</p>
                        <p className="text-xs text-gray-500">Upper jaw only</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('arch_type', 'lower')}
                      className={`px-4 py-3 rounded-lg border-2 text-center transition-all duration-200 ${
                        formData.arch_type === 'lower'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">Lower</p>
                        <p className="text-xs text-gray-500">Lower jaw only</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('arch_type', 'dual')}
                      className={`px-4 py-3 rounded-lg border-2 text-center transition-all duration-200 ${
                        formData.arch_type === 'dual'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">Dual</p>
                        <p className="text-xs text-gray-500">Both upper & lower</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Surgery Type */}
                {formData.arch_type && (
                  <div className="space-y-4">
                    {/* For dual arch - show upper and lower side by side */}
                    {formData.arch_type === 'dual' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Upper Surgery Type */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">
                            Upper Surgery Type <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              type="button"
                              onClick={() => handleInputChange('upper_surgery_type', 'surgery')}
                              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                                formData.upper_surgery_type === 'surgery'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgery
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputChange('upper_surgery_type', 'surgical_revision')}
                              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                                formData.upper_surgery_type === 'surgical_revision'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgical Revision
                            </button>
                          </div>
                        </div>

                        {/* Lower Surgery Type */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">
                            Lower Surgery Type <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-1 gap-2">
                            <button
                              type="button"
                              onClick={() => handleInputChange('lower_surgery_type', 'surgery')}
                              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                                formData.lower_surgery_type === 'surgery'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgery
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputChange('lower_surgery_type', 'surgical_revision')}
                              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                                formData.lower_surgery_type === 'surgical_revision'
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              Surgical Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* For single arch - show only relevant surgery type */}
                    {formData.arch_type === 'upper' && (
                      <div className="space-y-3">
                        <Label className="text-base font-medium">
                          Upper Surgery Type <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleInputChange('upper_surgery_type', 'surgery')}
                            className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                              formData.upper_surgery_type === 'surgery'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgery
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('upper_surgery_type', 'surgical_revision')}
                            className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                              formData.upper_surgery_type === 'surgical_revision'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgical Revision
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.arch_type === 'lower' && (
                      <div className="space-y-3">
                        <Label className="text-base font-medium">
                          Lower Surgery Type <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleInputChange('lower_surgery_type', 'surgery')}
                            className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                              formData.lower_surgery_type === 'surgery'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgery
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInputChange('lower_surgery_type', 'surgical_revision')}
                            className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                              formData.lower_surgery_type === 'surgical_revision'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            Surgical Revision
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Upper Implants (for upper or dual) */}
            {currentStep === 2 && (formData.arch_type === 'upper' || formData.arch_type === 'dual') && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Upper Implants
                    </h3>
                    <Button
                      type="button"
                      onClick={() => handleAddImplant('upper')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Implant
                    </Button>
                  </div>
                  <div className="min-h-[300px]">
                    {savedImplants.upper.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <p>Click "Add Implant" to add upper implant details...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {savedImplants.upper.map((implant) => (
                          <div key={implant.id} className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                            {/* Header with Position and Actions */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {implant.position}
                                </div>
                                <div>
                                  <h4 className="font-bold text-blue-900 text-sm">Tooth {implant.position}</h4>
                                  <p className="text-xs text-blue-700">
                                    {implant.implant_brand ? implant.implant_brand.toUpperCase() : 'No Brand'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditImplant(implant)}
                                  className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Edit implant"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImplant(implant)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Delete implant"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Implant Details */}
                            <div className="space-y-2 mb-3">
                              {implant.implant_subtype && (
                                <div className="bg-white/70 rounded-lg px-2 py-1">
                                  <p className="text-xs font-medium text-blue-800">Series: {implant.implant_subtype}</p>
                                </div>
                              )}
                              {implant.implant_size && (
                                <div className="bg-white/70 rounded-lg px-2 py-1">
                                  <p className="text-xs font-medium text-blue-800">Size: {implant.implant_size}</p>
                                </div>
                              )}
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {/* Implant Image */}
                              <div>
                                <p className="text-xs font-bold text-blue-800 mb-1">Implant</p>
                                {(implant.implant_picture || implant.implant_picture_url) ? (
                                  <div
                                    className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                    onClick={() => {
                                      const url = implant.implant_picture
                                        ? URL.createObjectURL(implant.implant_picture)
                                        : implant.implant_picture_url;
                                      if (url) handleStickerPreview(url, implant, 'implant');
                                    }}
                                    title="Click to view full size"
                                  >
                                    <img
                                      src={
                                        implant.implant_picture
                                          ? URL.createObjectURL(implant.implant_picture)
                                          : implant.implant_picture_url
                                      }
                                      alt="Implant sticker"
                                      className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        console.log('Implant image failed to load');
                                        if (implant.implant_picture_url && implant.implant_picture) {
                                          e.currentTarget.src = implant.implant_picture_url;
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-blue-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                    <Camera className="h-4 w-4 text-blue-400" />
                                  </div>
                                )}
                              </div>

                              {/* MUA Image */}
                              <div>
                                <p className="text-xs font-bold text-blue-800 mb-1">MUA</p>
                                {(implant.mua_picture || implant.mua_picture_url) ? (
                                  <div
                                    className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                    onClick={() => {
                                      const url = implant.mua_picture
                                        ? URL.createObjectURL(implant.mua_picture)
                                        : implant.mua_picture_url;
                                      if (url) handleStickerPreview(url, implant, 'mua');
                                    }}
                                    title="Click to view full size"
                                  >
                                    <img
                                      src={
                                        implant.mua_picture
                                          ? URL.createObjectURL(implant.mua_picture)
                                          : implant.mua_picture_url
                                      }
                                      alt="MUA sticker"
                                      className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-blue-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                    <Camera className="h-4 w-4 text-blue-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* MUA Details */}
                            {(implant.mua_brand || implant.mua_size) && (
                              <div className="bg-white/70 rounded-lg p-2 border border-blue-200">
                                <p className="text-xs font-bold text-blue-800 mb-1">MUA Details</p>
                                {implant.mua_brand && (
                                  <p className="text-xs text-blue-700">
                                    {implant.mua_brand && implant.mua_subtype ? `${implant.mua_brand} - ${implant.mua_subtype}` : implant.mua_brand}
                                  </p>
                                )}
                                {implant.mua_size && (
                                  <p className="text-xs text-blue-700">Size: {implant.mua_size}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Lower Implants (for lower only) */}
            {currentStep === 2 && formData.arch_type === 'lower' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Lower Implants
                    </h3>
                    <Button
                      type="button"
                      onClick={() => handleAddImplant('lower')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Implant
                    </Button>
                  </div>
                  <div className="min-h-[300px]">
                    {savedImplants.lower.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <p>Click "Add Implant" to add lower implant details...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {savedImplants.lower.map((implant) => (
                          <div key={implant.id} className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                            {/* Header with Position and Actions */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {implant.position}
                                </div>
                                <div>
                                  <h4 className="font-bold text-green-900 text-sm">Tooth {implant.position}</h4>
                                  <p className="text-xs text-green-700">
                                    {implant.implant_brand ? implant.implant_brand.toUpperCase() : 'No Brand'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditImplant(implant)}
                                  className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Edit implant"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImplant(implant)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Delete implant"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Implant Details */}
                            <div className="space-y-2 mb-3">
                              {implant.implant_subtype && (
                                <div className="bg-white/70 rounded-lg px-2 py-1">
                                  <p className="text-xs font-medium text-green-800">Series: {implant.implant_subtype}</p>
                                </div>
                              )}
                              {implant.implant_size && (
                                <div className="bg-white/70 rounded-lg px-2 py-1">
                                  <p className="text-xs font-medium text-green-800">Size: {implant.implant_size}</p>
                                </div>
                              )}
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {/* Implant Image */}
                              <div>
                                <p className="text-xs font-bold text-green-800 mb-1">Implant</p>
                                {(implant.implant_picture || implant.implant_picture_url) ? (
                                  <div
                                    className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                                    onClick={() => {
                                      const url = implant.implant_picture
                                        ? URL.createObjectURL(implant.implant_picture)
                                        : implant.implant_picture_url;
                                      if (url) handleStickerPreview(url, implant, 'implant');
                                    }}
                                    title="Click to view full size"
                                  >
                                    <img
                                      src={
                                        implant.implant_picture
                                          ? URL.createObjectURL(implant.implant_picture)
                                          : implant.implant_picture_url
                                      }
                                      alt="Implant sticker"
                                      className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        console.log('Implant image failed to load');
                                        if (implant.implant_picture_url && implant.implant_picture) {
                                          e.currentTarget.src = implant.implant_picture_url;
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-green-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                    <Camera className="h-4 w-4 text-green-400" />
                                  </div>
                                )}
                              </div>

                              {/* MUA Image */}
                              <div>
                                <p className="text-xs font-bold text-green-800 mb-1">MUA</p>
                                {(implant.mua_picture || implant.mua_picture_url) ? (
                                  <div
                                    className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                                    onClick={() => {
                                      const url = implant.mua_picture
                                        ? URL.createObjectURL(implant.mua_picture)
                                        : implant.mua_picture_url;
                                      if (url) handleStickerPreview(url, implant, 'mua');
                                    }}
                                    title="Click to view full size"
                                  >
                                    <img
                                      src={
                                        implant.mua_picture
                                          ? URL.createObjectURL(implant.mua_picture)
                                          : implant.mua_picture_url
                                      }
                                      alt="MUA sticker"
                                      className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-green-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                    <Camera className="h-4 w-4 text-green-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* MUA Details */}
                            {(implant.mua_brand || implant.mua_size) && (
                              <div className="bg-white/70 rounded-lg p-2 border border-green-200">
                                <p className="text-xs font-bold text-green-800 mb-1">MUA Details</p>
                                {implant.mua_brand && (
                                  <p className="text-xs text-green-700">
                                    {implant.mua_brand && implant.mua_subtype ? `${implant.mua_brand} - ${implant.mua_subtype}` : implant.mua_brand}
                                  </p>
                                )}
                                {implant.mua_size && (
                                  <p className="text-xs text-green-700">Size: {implant.mua_size}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Lower Implants (for dual only) */}
            {currentStep === 3 && formData.arch_type === 'dual' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Lower Implants
                    </h3>
                    <Button
                      type="button"
                      onClick={() => handleAddImplant('lower')}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Implant
                    </Button>
                  </div>
                  <div className="min-h-[300px]">
                    {savedImplants.lower.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                          <p>Click "Add Implant" to add lower implant details...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {savedImplants.lower.map((implant) => (
                          <div key={implant.id} className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                            {/* Header with Position and Actions */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  {implant.position}
                                </div>
                                <div>
                                  <h4 className="font-bold text-green-900 text-sm">Tooth {implant.position}</h4>
                                  <p className="text-xs text-green-700">
                                    {implant.implant_brand ? implant.implant_brand.toUpperCase() : 'No Brand'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditImplant(implant)}
                                  className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Edit implant"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteImplant(implant)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Delete implant"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Implant Details */}
                            <div className="space-y-2 mb-3">
                              {implant.implant_subtype && (
                                <div className="bg-white/70 rounded-lg px-2 py-1">
                                  <p className="text-xs font-medium text-green-800">Series: {implant.implant_subtype}</p>
                                </div>
                              )}
                              {implant.implant_size && (
                                <div className="bg-white/70 rounded-lg px-2 py-1">
                                  <p className="text-xs font-medium text-green-800">Size: {implant.implant_size}</p>
                                </div>
                              )}
                            </div>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {/* Implant Image */}
                              <div>
                                <p className="text-xs font-bold text-green-800 mb-1">Implant</p>
                                {(implant.implant_picture || implant.implant_picture_url) ? (
                                  <div
                                    className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                                    onClick={() => {
                                      const url = implant.implant_picture
                                        ? URL.createObjectURL(implant.implant_picture)
                                        : implant.implant_picture_url;
                                      if (url) handleStickerPreview(url, implant, 'implant');
                                    }}
                                    title="Click to view full size"
                                  >
                                    <img
                                      src={
                                        implant.implant_picture
                                          ? URL.createObjectURL(implant.implant_picture)
                                          : implant.implant_picture_url
                                      }
                                      alt="Implant sticker"
                                      className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                      onError={(e) => {
                                        console.log('Implant image failed to load');
                                        if (implant.implant_picture_url && implant.implant_picture) {
                                          e.currentTarget.src = implant.implant_picture_url;
                                        }
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-green-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                    <Camera className="h-4 w-4 text-green-400" />
                                  </div>
                                )}
                              </div>

                              {/* MUA Image */}
                              <div>
                                <p className="text-xs font-bold text-green-800 mb-1">MUA</p>
                                {(implant.mua_picture || implant.mua_picture_url) ? (
                                  <div
                                    className="border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                                    onClick={() => {
                                      const url = implant.mua_picture
                                        ? URL.createObjectURL(implant.mua_picture)
                                        : implant.mua_picture_url;
                                      if (url) handleStickerPreview(url, implant, 'mua');
                                    }}
                                    title="Click to view full size"
                                  >
                                    <img
                                      src={
                                        implant.mua_picture
                                          ? URL.createObjectURL(implant.mua_picture)
                                          : implant.mua_picture_url
                                      }
                                      alt="MUA sticker"
                                      className="w-full h-16 object-contain p-1 hover:scale-105 transition-transform duration-200"
                                    />
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-green-300 rounded-lg h-16 flex items-center justify-center bg-white/50">
                                    <Camera className="h-4 w-4 text-green-400" />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* MUA Details */}
                            {(implant.mua_brand || implant.mua_size) && (
                              <div className="bg-white/70 rounded-lg p-2 border border-green-200">
                                <p className="text-xs font-bold text-green-800 mb-1">MUA Details</p>
                                {implant.mua_brand && (
                                  <p className="text-xs text-green-700">
                                    {implant.mua_brand && implant.mua_subtype ? `${implant.mua_brand} - ${implant.mua_subtype}` : implant.mua_brand}
                                  </p>
                                )}
                                {implant.mua_size && (
                                  <p className="text-xs text-green-700">Size: {implant.mua_size}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions - exactly like IV sedation footer */}
          <div className="flex-shrink-0 flex justify-between items-center px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              Previous
            </Button>

            <Button
              type="button"
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {currentStep === totalSteps
                ? (isSubmitting
                    ? (editingSheet ? 'Updating...' : 'Saving...')
                    : (editingSheet ? 'Update' : 'Submit')
                  )
                : 'Next'
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Add Implant Dialog */}
      <Dialog open={showImplantDialog} onOpenChange={setShowImplantDialog}>
        <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingImplant ? (
                <Edit className="h-5 w-5 text-blue-600" />
              ) : (
                <Plus className="h-5 w-5 text-blue-600" />
              )}
              {editingImplant ? 'Edit' : 'Add'} {implantDialogType === 'upper' ? 'Upper' : 'Lower'} Implant
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="implant_position">Implant Position <span className="text-red-500">*</span></Label>
              <Select value={implantData.position} onValueChange={(value) => handleImplantDataChange('position', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${implantDialogType} tooth number`} />
                </SelectTrigger>
                <SelectContent>
                  {implantDialogType === 'upper' ? (
                    // Upper teeth numbers (1-16 in US numbering system)
                    <>
                      <SelectItem value="1">1 - Upper Right Third Molar</SelectItem>
                      <SelectItem value="2">2 - Upper Right Second Molar</SelectItem>
                      <SelectItem value="3">3 - Upper Right First Molar</SelectItem>
                      <SelectItem value="4">4 - Upper Right Second Premolar</SelectItem>
                      <SelectItem value="5">5 - Upper Right First Premolar</SelectItem>
                      <SelectItem value="6">6 - Upper Right Canine</SelectItem>
                      <SelectItem value="7">7 - Upper Right Lateral Incisor</SelectItem>
                      <SelectItem value="8">8 - Upper Right Central Incisor</SelectItem>
                      <SelectItem value="9">9 - Upper Left Central Incisor</SelectItem>
                      <SelectItem value="10">10 - Upper Left Lateral Incisor</SelectItem>
                      <SelectItem value="11">11 - Upper Left Canine</SelectItem>
                      <SelectItem value="12">12 - Upper Left First Premolar</SelectItem>
                      <SelectItem value="13">13 - Upper Left Second Premolar</SelectItem>
                      <SelectItem value="14">14 - Upper Left First Molar</SelectItem>
                      <SelectItem value="15">15 - Upper Left Second Molar</SelectItem>
                      <SelectItem value="16">16 - Upper Left Third Molar</SelectItem>
                    </>
                  ) : (
                    // Lower teeth numbers (17-32 in US numbering system)
                    <>
                      <SelectItem value="17">17 - Lower Left Third Molar</SelectItem>
                      <SelectItem value="18">18 - Lower Left Second Molar</SelectItem>
                      <SelectItem value="19">19 - Lower Left First Molar</SelectItem>
                      <SelectItem value="20">20 - Lower Left Second Premolar</SelectItem>
                      <SelectItem value="21">21 - Lower Left First Premolar</SelectItem>
                      <SelectItem value="22">22 - Lower Left Canine</SelectItem>
                      <SelectItem value="23">23 - Lower Left Lateral Incisor</SelectItem>
                      <SelectItem value="24">24 - Lower Left Central Incisor</SelectItem>
                      <SelectItem value="25">25 - Lower Right Central Incisor</SelectItem>
                      <SelectItem value="26">26 - Lower Right Lateral Incisor</SelectItem>
                      <SelectItem value="27">27 - Lower Right Canine</SelectItem>
                      <SelectItem value="28">28 - Lower Right First Premolar</SelectItem>
                      <SelectItem value="29">29 - Lower Right Second Premolar</SelectItem>
                      <SelectItem value="30">30 - Lower Right First Molar</SelectItem>
                      <SelectItem value="31">31 - Lower Right Second Molar</SelectItem>
                      <SelectItem value="32">32 - Lower Right Third Molar</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Two column layout starting from second row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="implant_brand">Implant Brand</Label>
                  <Select value={implantData.brand} onValueChange={(value) => {
                    handleImplantDataChange('brand', value);
                    // Reset subtype and size when brand changes
                    handleImplantDataChange('subtype', '');
                    handleImplantDataChange('size', '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neodent">Neodent</SelectItem>
                      <SelectItem value="sin">SIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtype dropdown - for both Neodent and SIN */}
                {(implantData.brand === 'neodent' || implantData.brand === 'sin') && (
                  <div>
                    <Label htmlFor="implant_subtype">Implant Series</Label>
                    <Select value={implantData.subtype} onValueChange={(value) => {
                      handleImplantDataChange('subtype', value);
                      // Reset size when subtype changes
                      handleImplantDataChange('size', '');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select series" />
                      </SelectTrigger>
                      <SelectContent>
                        {implantData.brand === 'neodent' && (
                          <>
                            <SelectItem value="GM HELIX ACQUA">GM HELIX ACQUA</SelectItem>
                            <SelectItem value="GM ZYGOMA">GM ZYGOMA</SelectItem>
                            <SelectItem value="GM ZYGOMA S">GM ZYGOMA S</SelectItem>
                          </>
                        )}
                        {implantData.brand === 'sin' && (
                          <SelectItem value="Epikut Plus">Epikut Plus</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="implant_size">Implant Size</Label>
                  {(implantData.brand === 'neodent' || implantData.brand === 'sin') && implantData.subtype ? (
                    <Select value={implantData.size} onValueChange={(value) => handleImplantDataChange('size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${implantData.subtype} size`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                    {implantData.subtype === 'GM HELIX ACQUA' && (
                      <>
                        <SelectItem value="3.5 X 8">3.5 X 8</SelectItem>
                        <SelectItem value="3.5 X 10">3.5 X 10</SelectItem>
                        <SelectItem value="3.5 X 11.5">3.5 X 11.5</SelectItem>
                        <SelectItem value="3.5 X 13">3.5 X 13</SelectItem>
                        <SelectItem value="3.5 X 16">3.5 X 16</SelectItem>
                        <SelectItem value="3.5 X 18">3.5 X 18</SelectItem>
                        <SelectItem value="3.75 X 8">3.75 X 8</SelectItem>
                        <SelectItem value="3.75 X 10">3.75 X 10</SelectItem>
                        <SelectItem value="3.75 X 11.5">3.75 X 11.5</SelectItem>
                        <SelectItem value="3.75 X 13">3.75 X 13</SelectItem>
                        <SelectItem value="3.75 X 16">3.75 X 16</SelectItem>
                        <SelectItem value="3.75 X 18">3.75 X 18</SelectItem>
                        <SelectItem value="3.75 X 20">3.75 X 20</SelectItem>
                        <SelectItem value="3.75 X 22.5">3.75 X 22.5</SelectItem>
                        <SelectItem value="3.75 X 25">3.75 X 25</SelectItem>
                        <SelectItem value="4 X 8">4 X 8</SelectItem>
                        <SelectItem value="4 X 10">4 X 10</SelectItem>
                        <SelectItem value="4 X 11.5">4 X 11.5</SelectItem>
                        <SelectItem value="4 X 13">4 X 13</SelectItem>
                        <SelectItem value="4 X 16">4 X 16</SelectItem>
                        <SelectItem value="4 X 18">4 X 18</SelectItem>
                        <SelectItem value="4 X 20">4 X 20</SelectItem>
                        <SelectItem value="4 X 22.5">4 X 22.5</SelectItem>
                        <SelectItem value="4 X 25">4 X 25</SelectItem>
                        <SelectItem value="4.3 X 8">4.3 X 8</SelectItem>
                        <SelectItem value="4.3 X 10">4.3 X 10</SelectItem>
                        <SelectItem value="4.3 X 11.5">4.3 X 11.5</SelectItem>
                        <SelectItem value="4.3 X 13">4.3 X 13</SelectItem>
                        <SelectItem value="4.3 X 16">4.3 X 16</SelectItem>
                        <SelectItem value="4.3 X 18">4.3 X 18</SelectItem>
                        <SelectItem value="5.0 X 8">5.0 X 8</SelectItem>
                        <SelectItem value="5.0 X 10">5.0 X 10</SelectItem>
                        <SelectItem value="5.0 X 11.5">5.0 X 11.5</SelectItem>
                        <SelectItem value="5.0 X 13">5.0 X 13</SelectItem>
                        <SelectItem value="5.0 X 16">5.0 X 16</SelectItem>
                        <SelectItem value="5.0 X 18">5.0 X 18</SelectItem>
                        <SelectItem value="6.0 X 8">6.0 X 8</SelectItem>
                        <SelectItem value="6.0 X 10">6.0 X 10</SelectItem>
                        <SelectItem value="6.0 X 11.5">6.0 X 11.5</SelectItem>
                        <SelectItem value="6.0 X 13">6.0 X 13</SelectItem>
                        <SelectItem value="7.0 X 8">7.0 X 8</SelectItem>
                        <SelectItem value="7.0 X 10">7.0 X 10</SelectItem>
                        <SelectItem value="7.0 X 11.5">7.0 X 11.5</SelectItem>
                        <SelectItem value="7.0 X 13">7.0 X 13</SelectItem>
                      </>
                    )}

                    {implantData.subtype === 'GM ZYGOMA' && (
                      <>
                        <SelectItem value="4 X 30">4 X 30</SelectItem>
                        <SelectItem value="4 X 35">4 X 35</SelectItem>
                        <SelectItem value="4 X 37.5">4 X 37.5</SelectItem>
                        <SelectItem value="4 X 40">4 X 40</SelectItem>
                        <SelectItem value="4 X 42.5">4 X 42.5</SelectItem>
                        <SelectItem value="4 X 45">4 X 45</SelectItem>
                        <SelectItem value="4 X 47.5">4 X 47.5</SelectItem>
                        <SelectItem value="4 X 50">4 X 50</SelectItem>
                        <SelectItem value="4 X 52.5">4 X 52.5</SelectItem>
                        <SelectItem value="4 X 55">4 X 55</SelectItem>
                      </>
                    )}

                    {implantData.subtype === 'GM ZYGOMA S' && (
                      <>
                        <SelectItem value="3.5 X 30">3.5 X 30</SelectItem>
                        <SelectItem value="3.5 X 35">3.5 X 35</SelectItem>
                        <SelectItem value="3.5 X 37.5">3.5 X 37.5</SelectItem>
                        <SelectItem value="3.5 X 40">3.5 X 40</SelectItem>
                        <SelectItem value="3.5 X 42.5">3.5 X 42.5</SelectItem>
                        <SelectItem value="3.5 X 45">3.5 X 45</SelectItem>
                        <SelectItem value="3.5 X 47.5">3.5 X 47.5</SelectItem>
                        <SelectItem value="3.5 X 50">3.5 X 50</SelectItem>
                        <SelectItem value="3.5 X 52.5">3.5 X 52.5</SelectItem>
                        <SelectItem value="3.5 X 55">3.5 X 55</SelectItem>
                        <SelectItem value="3.75 X 30">3.75 X 30</SelectItem>
                        <SelectItem value="3.75 X 35">3.75 X 35</SelectItem>
                        <SelectItem value="3.75 X 37.5">3.75 X 37.5</SelectItem>
                        <SelectItem value="3.75 X 40">3.75 X 40</SelectItem>
                        <SelectItem value="3.75 X 42.5">3.75 X 42.5</SelectItem>
                        <SelectItem value="3.75 X 45">3.75 X 45</SelectItem>
                        <SelectItem value="3.75 X 47.5">3.75 X 47.5</SelectItem>
                        <SelectItem value="3.75 X 50">3.75 X 50</SelectItem>
                        <SelectItem value="3.75 X 52.5">3.75 X 52.5</SelectItem>
                        <SelectItem value="3.75 X 55">3.75 X 55</SelectItem>
                      </>
                    )}

                    {implantData.subtype === 'Epikut Plus' && (
                      <>
                        <SelectItem value="3.5 X 8.5">3.5 X 8.5</SelectItem>
                        <SelectItem value="3.5 X 10">3.5 X 10</SelectItem>
                        <SelectItem value="3.5 X 11.5">3.5 X 11.5</SelectItem>
                        <SelectItem value="3.5 X 13">3.5 X 13</SelectItem>
                        <SelectItem value="3.5 X 15">3.5 X 15</SelectItem>
                        <SelectItem value="3.8 X 8.5">3.8 X 8.5</SelectItem>
                        <SelectItem value="3.8 X 10">3.8 X 10</SelectItem>
                        <SelectItem value="3.8 X 11.5">3.8 X 11.5</SelectItem>
                        <SelectItem value="3.8 X 13">3.8 X 13</SelectItem>
                        <SelectItem value="3.8 X 15">3.8 X 15</SelectItem>
                        <SelectItem value="4.5 X 8.5">4.5 X 8.5</SelectItem>
                        <SelectItem value="4.5 X 10">4.5 X 10</SelectItem>
                        <SelectItem value="4.5 X 11.5">4.5 X 11.5</SelectItem>
                        <SelectItem value="4.5 X 13">4.5 X 13</SelectItem>
                        <SelectItem value="4.5 X 15">4.5 X 15</SelectItem>
                        <SelectItem value="5 X 8.5">5 X 8.5</SelectItem>
                        <SelectItem value="5 X 10">5 X 10</SelectItem>
                        <SelectItem value="5 X 11.5">5 X 11.5</SelectItem>
                        <SelectItem value="5 X 13">5 X 13</SelectItem>
                        <SelectItem value="5 X 15">5 X 15</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                  ) : (
                    <Input
                      id="implant_size"
                      value={implantData.size}
                      onChange={(e) => handleImplantDataChange('size', e.target.value)}
                      placeholder={
                        (implantData.brand === 'neodent' || implantData.brand === 'sin') && !implantData.subtype
                          ? "Select series first"
                          : "Enter implant size"
                      }
                      disabled={(implantData.brand === 'neodent' || implantData.brand === 'sin') && !implantData.subtype}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="implant_picture">Implant Sticker Picture</Label>
                  <div className="space-y-3">
                    {/* Hidden file input */}
                    <input
                      ref={implantPictureInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.target.files?.[0] || null;
                        handleFileChange('implant_picture', file);
                      }}
                      className="hidden"
                    />

                    {/* Custom capture button with image preview */}
                    {!implantData.implant_picture && !implantPreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => implantPictureInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-transparent border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50/20 transition-colors rounded-lg text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Camera className="h-5 w-5" />
                        Capture Implant Sticker
                      </button>
                    ) : (
                      <div className="w-full border-2 border-green-400 rounded-lg overflow-hidden bg-white">
                        {/* Image Preview */}
                        <div className="w-full bg-gray-50 flex items-center justify-center p-2">
                          <img
                            src={implantPreviewUrl || (implantData.implant_picture ? URL.createObjectURL(implantData.implant_picture) : '')}
                            alt="Implant sticker preview"
                            className="w-full h-auto max-h-32 object-contain rounded"
                          />
                        </div>

                        {/* Controls */}
                        <div className="p-3 bg-green-50 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-700 font-medium">
                                ✓ {implantData.implant_picture ? 'Captured Successfully' : 'Existing Image'}
                              </p>
                              <p className="text-xs text-green-600">
                                {implantData.implant_picture
                                  ? `Size: ${(implantData.implant_picture.size / 1024).toFixed(1)} KB`
                                  : 'From storage'
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = implantData.implant_picture
                                    ? URL.createObjectURL(implantData.implant_picture)
                                    : implantPreviewUrl;
                                  if (url) {
                                    setPreviewImage({
                                      url,
                                      name: implantData.implant_picture?.name || 'existing-image',
                                      type: 'implant'
                                    });
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => implantPictureInputRef.current?.click()}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                <Camera className="h-3 w-3" />
                                Retake
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - MUA Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mua_brand">MUA Brand</Label>
                  <Select value={implantData.mua_brand} onValueChange={(value) => {
                    handleImplantDataChange('mua_brand', value);
                    // Reset subtype and size when brand changes
                    handleImplantDataChange('mua_subtype', '');
                    handleImplantDataChange('mua_size', '');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select MUA brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neodent">Neodent</SelectItem>
                      <SelectItem value="sin">SIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* MUA Subtype dropdown - for both Neodent and SIN */}
                {(implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && (
                  <div>
                    <Label htmlFor="mua_subtype">MUA Series</Label>
                    <Select value={implantData.mua_subtype} onValueChange={(value) => {
                      handleImplantDataChange('mua_subtype', value);
                      // Reset size when subtype changes
                      handleImplantDataChange('mua_size', '');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select MUA series" />
                      </SelectTrigger>
                      <SelectContent>
                        {implantData.mua_brand === 'neodent' && (
                          <SelectItem value="GM MUA">GM MUA</SelectItem>
                        )}
                        {implantData.mua_brand === 'sin' && (
                          <SelectItem value="SIN MUA">SIN MUA</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="mua_size">MUA Size</Label>
                  {(implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && implantData.mua_subtype ? (
                    <Select value={implantData.mua_size} onValueChange={(value) => handleImplantDataChange('mua_size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${implantData.mua_subtype} size`} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {implantData.mua_subtype === 'GM MUA' && (
                          <>
                            <SelectItem value="0° X 0.8">0° X 0.8</SelectItem>
                            <SelectItem value="0° X 1.5">0° X 1.5</SelectItem>
                            <SelectItem value="0° X 2.5">0° X 2.5</SelectItem>
                            <SelectItem value="0° X 3.5">0° X 3.5</SelectItem>
                            <SelectItem value="0° X 4.5">0° X 4.5</SelectItem>
                            <SelectItem value="0° X 5.5">0° X 5.5</SelectItem>
                            <SelectItem value="17° X 1.5">17° X 1.5</SelectItem>
                            <SelectItem value="17° X 2.5">17° X 2.5</SelectItem>
                            <SelectItem value="17° X 3.5">17° X 3.5</SelectItem>
                            <SelectItem value="30° X 1.5">30° X 1.5</SelectItem>
                            <SelectItem value="30° X 2.5">30° X 2.5</SelectItem>
                            <SelectItem value="30° X 3.5">30° X 3.5</SelectItem>
                            <SelectItem value="45° X 1.5">45° X 1.5</SelectItem>
                            <SelectItem value="45° X 2.5">45° X 2.5</SelectItem>
                            <SelectItem value="45° Slim X 1.5">45° Slim X 1.5</SelectItem>
                            <SelectItem value="45° Slim X 2.5">45° Slim X 2.5</SelectItem>
                            <SelectItem value="52° X 1.5">52° X 1.5</SelectItem>
                            <SelectItem value="52° X 2.5">52° X 2.5</SelectItem>
                            <SelectItem value="60° X 1.5">60° X 1.5</SelectItem>
                            <SelectItem value="60° X 2.5">60° X 2.5</SelectItem>
                          </>
                        )}

                        {implantData.mua_subtype === 'SIN MUA' && (
                          <>
                            <SelectItem value="MUA-Straight - 4.8 X 0.8">MUA-Straight - 4.8 X 0.8</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 1.5">MUA-Straight - 4.8 X 1.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 2.5">MUA-Straight - 4.8 X 2.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 3.5">MUA-Straight - 4.8 X 3.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 4.5">MUA-Straight - 4.8 X 4.5</SelectItem>
                            <SelectItem value="MUA-Straight - 4.8 X 5.5">MUA-Straight - 4.8 X 5.5</SelectItem>
                            <SelectItem value="MUA-17° X 4.8 X 1.5">MUA-17° X 4.8 X 1.5</SelectItem>
                            <SelectItem value="MUA-17° X 4.8 X 2.5">MUA-17° X 4.8 X 2.5</SelectItem>
                            <SelectItem value="MUA-17° X 4.8 X 3.5">MUA-17° X 4.8 X 3.5</SelectItem>
                            <SelectItem value="MUA-30° X 4.8 X 1.5">MUA-30° X 4.8 X 1.5</SelectItem>
                            <SelectItem value="MUA-30° X 4.8 X 2.5">MUA-30° X 4.8 X 2.5</SelectItem>
                            <SelectItem value="MUA-30° X 4.8 X 3.5">MUA-30° X 4.8 X 3.5</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="mua_size"
                      value={implantData.mua_size}
                      onChange={(e) => handleImplantDataChange('mua_size', e.target.value)}
                      placeholder={
                        (implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && !implantData.mua_subtype
                          ? "Select MUA series first"
                          : "Enter MUA size"
                      }
                      disabled={(implantData.mua_brand === 'neodent' || implantData.mua_brand === 'sin') && !implantData.mua_subtype}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="mua_picture">MUA Sticker Picture</Label>
                  <div className="space-y-3">
                    {/* Hidden file input */}
                    <input
                      ref={muaPictureInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const file = e.target.files?.[0] || null;
                        handleFileChange('mua_picture', file);
                      }}
                      className="hidden"
                    />

                    {/* Custom capture button with image preview */}
                    {!implantData.mua_picture && !muaPreviewUrl ? (
                      <button
                        type="button"
                        onClick={() => muaPictureInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-transparent border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50/20 transition-colors rounded-lg text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Camera className="h-5 w-5" />
                        Capture MUA Sticker
                      </button>
                    ) : (
                      <div className="w-full border-2 border-green-400 rounded-lg overflow-hidden bg-white">
                        {/* Image Preview */}
                        <div className="w-full bg-gray-50 flex items-center justify-center p-2">
                          <img
                            src={muaPreviewUrl || (implantData.mua_picture ? URL.createObjectURL(implantData.mua_picture) : '')}
                            alt="MUA sticker preview"
                            className="w-full h-auto max-h-32 object-contain rounded"
                          />
                        </div>

                        {/* Controls */}
                        <div className="p-3 bg-green-50 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-green-700 font-medium">
                                ✓ {implantData.mua_picture ? 'Captured Successfully' : 'Existing Image'}
                              </p>
                              <p className="text-xs text-green-600">
                                {implantData.mua_picture
                                  ? `Size: ${(implantData.mua_picture.size / 1024).toFixed(1)} KB`
                                  : 'From storage'
                                }
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const url = implantData.mua_picture
                                    ? URL.createObjectURL(implantData.mua_picture)
                                    : muaPreviewUrl;
                                  if (url) {
                                    setPreviewImage({
                                      url,
                                      name: implantData.mua_picture?.name || 'existing-image',
                                      type: 'mua'
                                    });
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => muaPictureInputRef.current?.click()}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                              >
                                <Camera className="h-3 w-3" />
                                Retake
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImplantDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveImplant}
              disabled={isSavingImplant}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isSavingImplant ? 'Uploading Images...' : (editingImplant ? 'Update Implant' : 'Save Implant')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={closePreview}>
        <DialogContent className="max-w-fit max-h-[95vh] overflow-hidden flex flex-col p-0">
          {/* Simple Header */}
          <div className="p-4 border-b bg-white">
            <h2 className="text-lg font-semibold text-gray-900">
              {previewImage?.type === 'implant' ? 'Implant Sticker' : 'MUA Sticker'} Preview
            </h2>
          </div>

          {previewImage && (
            <>
              {/* Image Display Area */}
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
                <div
                  ref={cropContainerRef}
                  className="relative touch-none select-none"
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  style={{
                    cursor: isCropping ? 'crosshair' : 'default',
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <img
                    ref={imageRef}
                    src={previewImage.url}
                    alt={`${previewImage.type} sticker preview`}
                    className="max-w-[64vw] max-h-[56vh] object-contain rounded-lg shadow-lg"
                    draggable={false}
                  />

                  {/* Crop Overlay */}
                  {isCropping && cropArea && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/10"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-blue-300/50" />
                        ))}
                      </div>

                      {/* Resize Handles */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-se-resize" />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-4 bg-blue-500 rounded border-2 border-white shadow-lg cursor-s-resize" />
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-6 bg-blue-500 rounded border-2 border-white shadow-lg cursor-e-resize" />

                      {/* Move Handle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-move flex items-center justify-center">
                        <Move className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Simple Footer with Controls */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-t bg-white">
                <div className="flex items-center gap-3">
                  {/* Zoom Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ZoomOut className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ZoomIn className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Rotation Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((rotation - 90) % 360)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[35px] text-center">
                      {rotation}°
                    </span>
                    <button
                      type="button"
                      onClick={() => setRotation((rotation + 90) % 360)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <RotateCw className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isCropping ? (
                    <>
                      <button
                        type="button"
                        onClick={startCropping}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Crop className="h-4 w-4" />
                        Crop
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Close the preview dialog
                          closePreview();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Submit
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCrop}
                      disabled={!cropArea}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Apply
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden canvas for cropping */}
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Implant
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this implant? This action will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
              <li>Remove the implant from your form</li>
              <li>Delete all associated images from storage</li>
              <li>This action cannot be undone</li>
            </ul>
            {implantToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="font-medium text-gray-900">
                  Position {implantToDelete.position}
                </p>
                <p className="text-sm text-gray-600">
                  {implantToDelete.implant_brand && implantToDelete.implant_subtype
                    ? `${implantToDelete.implant_brand} - ${implantToDelete.implant_subtype}`
                    : implantToDelete.implant_brand || 'No brand specified'}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDeleteImplant}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDeleteImplant}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Implant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticker Preview Dialog */}
      <Dialog open={!!stickerPreview} onOpenChange={closeStickerPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              {stickerPreview?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            {stickerPreview && (
              <img
                src={stickerPreview.url}
                alt={stickerPreview.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                style={{ minHeight: '200px' }}
              />
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={closeStickerPreview}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
