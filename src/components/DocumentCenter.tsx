import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Upload, FileText, Image, File, Trash2, Download, Eye, 
  FolderOpen, Search, Filter, X, Loader2, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  uploadPatientDocument, 
  getPatientDocuments, 
  deletePatientDocument,
  updatePatientDocument,
  PatientDocument,
  DOCUMENT_CATEGORIES 
} from '@/services/patientDocumentService';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface DocumentCenterProps {
  patientId: string;
  patientName: string;
}

export function DocumentCenter({ patientId, patientName }: DocumentCenterProps) {
  const { userProfile } = useAuth();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await getPatientDocuments(patientId);
    setDocuments(docs);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (const file of selectedFiles) {
      const result = await uploadPatientDocument(
        file,
        patientId,
        uploadCategory,
        uploadDescription,
        userProfile?.id || null
      );
      if (result) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} document(s) uploaded successfully`);
      loadDocuments();
    } else {
      toast.error('Failed to upload documents');
    }

    setUploading(false);
    setShowUploadDialog(false);
    setSelectedFiles([]);
    setUploadCategory('general');
    setUploadDescription('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    
    const success = await deletePatientDocument(selectedDocument);
    if (success) {
      toast.success('Document deleted successfully');
      loadDocuments();
    } else {
      toast.error('Failed to delete document');
    }
    setShowDeleteDialog(false);
    setSelectedDocument(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      xray: 'bg-purple-100 text-purple-700',
      scan: 'bg-blue-100 text-blue-700',
      photo: 'bg-green-100 text-green-700',
      insurance: 'bg-yellow-100 text-yellow-700',
      consent: 'bg-pink-100 text-pink-700',
      lab: 'bg-orange-100 text-orange-700',
      referral: 'bg-teal-100 text-teal-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.general;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const canPreview = (fileType: string) => {
    return fileType.startsWith('image/') || fileType === 'application/pdf';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="pl-0 pr-0 pt-2 pb-2" style={{ height: 'calc(100vh - 280px)' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Document Center ({documents.length})
              </h3>
            </div>
            <Button onClick={() => setShowUploadDialog(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-9">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FolderOpen className="h-16 w-16 mb-4" />
                <p className="text-lg font-medium">No documents found</p>
                <p className="text-sm">Upload documents to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg border border-gray-200">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate" title={doc.file_name}>
                          {doc.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.file_size)} • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge className={`${getCategoryColor(doc.category)} border-0 text-xs`}>
                        {DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-2">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      {canPreview(doc.file_type) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => { setSelectedDocument(doc); setShowPreviewDialog(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => window.open(doc.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => { setSelectedDocument(doc); setShowDeleteDialog(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Files</Label>
              <div
                className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to select files or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, Images, Word, Excel up to 50MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                />
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-2 py-1">
                      <File className="h-4 w-4" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Add a description..."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
              {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDocument?.file_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.file_name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedDocument?.file_type.startsWith('image/') ? (
              <img src={selectedDocument.file_url} alt={selectedDocument.file_name} className="max-w-full h-auto mx-auto" />
            ) : selectedDocument?.file_type === 'application/pdf' ? (
              <iframe src={selectedDocument.file_url} className="w-full h-[70vh]" title={selectedDocument.file_name} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

