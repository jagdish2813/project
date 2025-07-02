import React, { useState } from 'react';
import { Camera, Upload, X, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useDesignerProfile } from '../hooks/useDesignerProfile';

interface ProjectUpdateFormProps {
  projectId: string;
  onUpdateSubmitted: () => void;
}

const ProjectUpdateForm: React.FC<ProjectUpdateFormProps> = ({ projectId, onUpdateSubmitted }) => {
  const { user } = useAuth();
  const { designer } = useDesignerProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    update_type: 'progress_report',
    completion_percentage: 0,
    photos: [] as string[]
  });
  
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const updateTypes = [
    { value: 'progress_report', label: 'Progress Report' },
    { value: 'photo_update', label: 'Photo Update' },
    { value: 'milestone', label: 'Milestone Completion' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'completion_percentage') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Validate file types and sizes
    const newFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (not an image)`);
        continue;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (exceeds 5MB)`);
        continue;
      }
      
      newFiles.push(file);
    }
    
    if (invalidFiles.length > 0) {
      setError(`Some files couldn't be added: ${invalidFiles.join(', ')}`);
    }
    
    if (newFiles.length === 0) return;
    
    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setPhotoFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Clear error if there was one
    if (error && newFiles.length > 0) setError(null);
  };

  const removePhoto = (index: number) => {
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photoFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    const totalFiles = photoFiles.length;
    let filesUploaded = 0;
    
    for (const file of photoFiles) {
      try {
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${user?.id || 'anonymous'}/${fileName}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('project-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (error) throw error;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(data.path);
        
        uploadedUrls.push(publicUrl);
        
        // Update progress
        filesUploaded++;
        setUploadProgress(Math.round((filesUploaded / totalFiles) * 100));
        
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !designer) {
      setError('You must be logged in as a designer to submit updates');
      return;
    }
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (formData.update_type === 'progress_report' && !formData.description.trim()) {
      setError('Description is required for progress reports');
      return;
    }
    
    if (formData.update_type === 'photo_update' && photoFiles.length === 0) {
      setError('Please upload at least one photo for photo updates');
      return;
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // First upload photos if any
      let photoUrls: string[] = [];
      if (photoFiles.length > 0) {
        photoUrls = await uploadPhotos();
      }
      
      // Then create the update record
      const { error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          designer_id: designer.id,
          title: formData.title,
          description: formData.description,
          update_type: formData.update_type,
          photos: photoUrls,
          completion_percentage: formData.update_type === 'progress_report' ? formData.completion_percentage : null
        });
      
      if (error) throw error;
      
      // Show success message
      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          update_type: 'progress_report',
          completion_percentage: 0,
          photos: []
        });
        setPhotoFiles([]);
        setPreviewUrls([]);
        setSuccess(false);
        onUpdateSubmitted();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting update:', error);
      setError(error.message || 'Failed to submit update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-secondary-800 mb-4">
        Add Project Update
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>Update submitted successfully!</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Type *
          </label>
          <select
            name="update_type"
            value={formData.update_type}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            {updateTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Week 2 Progress, Kitchen Cabinets Installed"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description {formData.update_type === 'progress_report' ? '*' : ''}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Provide details about the progress, challenges, and next steps..."
            required={formData.update_type === 'progress_report'}
          />
        </div>
        
        {formData.update_type === 'progress_report' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Percentage: {formData.completion_percentage}%
            </label>
            <input
              type="range"
              name="completion_percentage"
              value={formData.completion_percentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="5"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos {formData.update_type === 'photo_update' ? '*' : '(optional)'}
          </label>
          
          {/* Photo previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-24 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* File upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              id="photos"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="photos" className="cursor-pointer block">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Click to upload photos</p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG (max. 5MB per image)</p>
            </label>
          </div>
        </div>
        
        {loading && uploadProgress > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700 mb-2">Uploading photos: {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Update</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectUpdateForm;