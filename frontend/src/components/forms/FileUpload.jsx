import {
    CloudArrowUpIcon,
    DocumentIcon,
    PhotoIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';

const FileUpload = ({
  label,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  files = [],
  onChange,
  onRemove,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  dragAndDrop = true,
  showPreview = true,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    setUploadError('');
    const fileArray = Array.from(selectedFiles);
    
    // Validate file size
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setUploadError(`Some files exceed the maximum size of ${formatFileSize(maxSize)}`);
      return;
    }

    // Validate file count
    const totalFiles = files.length + fileArray.length;
    if (totalFiles > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    if (accept) {
      const allowedTypes = accept.split(',').map(type => type.trim());
      const invalidFiles = fileArray.filter(file => {
        return !allowedTypes.some(allowedType => {
          if (allowedType.startsWith('.')) {
            return file.name.toLowerCase().endsWith(allowedType.toLowerCase());
          }
          return file.type.match(allowedType.replace('*', '.*'));
        });
      });
      
      if (invalidFiles.length > 0) {
        setUploadError('Some files have invalid file types');
        return;
      }
    }

    if (onChange) {
      onChange(multiple ? [...files, ...fileArray] : fileArray[0]);
    }
  };

  const handleInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && dragAndDrop) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled && dragAndDrop) {
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFileSelect(droppedFiles);
      }
    }
  };

  const handleRemoveFile = (index) => {
    if (onRemove) {
      onRemove(index);
    } else if (onChange) {
      if (multiple) {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
      } else {
        onChange(null);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="h-8 w-8 text-blue-500" />;
    }
    return <DocumentIcon className="h-8 w-8 text-gray-500" />;
  };

  const fileList = multiple ? files : (files ? [files] : []);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className={`form-label ${required ? 'form-label-required' : ''}`}>
          {label}
        </label>
      )}

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          ${isDragging ? 'border-red-400 bg-red-50' : 'border-gray-300'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-red-400 cursor-pointer'}
          ${error || uploadError ? 'border-red-300' : ''}
          transition-colors duration-200
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />

        <CloudArrowUpIcon className={`mx-auto h-12 w-12 mb-4 ${
          isDragging ? 'text-red-500' : 'text-gray-400'
        }`} />

        <div className="text-sm text-gray-600">
          <span className="font-medium text-red-600 hover:text-red-500">
            Click to upload
          </span>
          {dragAndDrop && ' or drag and drop'}
        </div>

        <p className="text-xs text-gray-500 mt-1">
          {accept && `Accepted: ${accept}`}
          {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
          {multiple && ` • Max files: ${maxFiles}`}
        </p>
      </div>

      {/* File list */}
      {fileList.length > 0 && showPreview && (
        <div className="mt-4 space-y-2">
          {fileList.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-150"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error messages */}
      {(error || uploadError || helperText) && (
        <div className="mt-1">
          {(error || uploadError) ? (
            <p className="form-error">{error || uploadError}</p>
          ) : (
            <p className="form-help">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;