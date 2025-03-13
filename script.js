/**
 * Image Compressor Website
 * A professional tool for compressing, resizing and converting images
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const editorContainer = document.getElementById('editorContainer');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const originalDimensions = document.getElementById('originalDimensions');
    const compressedSize = document.getElementById('compressedSize');
    const compressedDimensions = document.getElementById('compressedDimensions');
    const reductionPercentage = document.getElementById('reductionPercentage');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const maxSizeInput = document.getElementById('maxSizeInput');
    const resizeCheckbox = document.getElementById('resizeCheckbox');
    const resizeOptions = document.getElementById('resizeOptions');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectRatioCheckbox = document.getElementById('aspectRatioCheckbox');
    const formatOptions = document.getElementsByName('format');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // Variables to store image data
    let originalFile = null;
    let originalImageData = null;
    let compressedImageData = null;
    let originalWidth = 0;
    let originalHeight = 0;

    // Initialize
    initializeEventListeners();

    /**
     * Set up event listeners for user interactions
     */
    function initializeEventListeners() {
        // Drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropArea.classList.add('active');
        }

        function unhighlight() {
            dropArea.classList.remove('active');
        }

        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false);
        
        // Handle file input change
        fileInput.addEventListener('change', handleFileSelect, false);
        
        // Handle click on drop area
        dropArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Handle quality slider change
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = `${qualitySlider.value}%`;
        });

        // Handle resize checkbox change
        resizeCheckbox.addEventListener('change', () => {
            resizeOptions.style.display = resizeCheckbox.checked ? 'block' : 'none';
        });

        // Handle width/height input for aspect ratio
        widthInput.addEventListener('input', () => {
            if (aspectRatioCheckbox.checked && originalWidth && originalHeight) {
                const ratio = originalHeight / originalWidth;
                heightInput.value = Math.round(widthInput.value * ratio);
            }
        });

        heightInput.addEventListener('input', () => {
            if (aspectRatioCheckbox.checked && originalWidth && originalHeight) {
                const ratio = originalWidth / originalHeight;
                widthInput.value = Math.round(heightInput.value * ratio);
            }
        });

        // Handle compress button click
        compressBtn.addEventListener('click', compressImage);
        
        // Handle download button click
        downloadBtn.addEventListener('click', downloadImage);
    }

    /**
     * Handle file drop event
     * @param {Event} e - The drop event
     */
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }

    /**
     * Handle file select from input
     * @param {Event} e - The change event
     */
    function handleFileSelect(e) {
        const files = e.target.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }

    /**
     * Process the uploaded files
     * @param {FileList} files - The list of files
     */
    function handleFiles(files) {
        // Check if file is an image
        const file = files[0];
        const imageType = /^image\//;
        
        if (!imageType.test(file.type)) {
            alert('Please select an image file.');
            return;
        }
        
        originalFile = file;
        
        // Display file info
        displayFileInfo(file);
        
        // Read and display the image
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Display original image
            originalImage.src = e.target.result;
            originalImageData = e.target.result;
            
            // Get original image dimensions
            const img = new Image();
            img.onload = function() {
                originalWidth = img.width;
                originalHeight = img.height;
                originalDimensions.textContent = `${originalWidth} x ${originalHeight}`;
                
                // Set default resize values
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                
                // Enable compress button
                compressBtn.disabled = false;
                
                // Show editor container
                editorContainer.style.display = 'block';
            };
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Display file information
     * @param {File} file - The image file
     */
    function displayFileInfo(file) {
        // Display file size
        const size = file.size;
        originalSize.textContent = formatFileSize(size);
    }

    /**
     * Format file size to human-readable format
     * @param {number} bytes - The file size in bytes
     * @returns {string} Formatted file size
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Compress the image based on user settings
     */
    function compressImage() {
        if (!originalImageData) return;
        
        // Get selected format
        let selectedFormat = 'image/jpeg'; // Default
        for (const option of formatOptions) {
            if (option.checked) {
                switch (option.value) {
                    case 'jpeg':
                        selectedFormat = 'image/jpeg';
                        break;
                    case 'png':
                        selectedFormat = 'image/png';
                        break;
                    case 'webp':
                        selectedFormat = 'image/webp';
                        break;
                }
                break;
            }
        }
        
        // Get quality value
        const quality = parseInt(qualitySlider.value) / 100;
        
        // Create a canvas element for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create an image element
        const img = new Image();
        
        img.onload = function() {
            // Calculate dimensions
            let width = img.width;
            let height = img.height;
            
            // Handle resize if enabled
            if (resizeCheckbox.checked) {
                width = parseInt(widthInput.value) || width;
                height = parseInt(heightInput.value) || height;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get compressed image data
            const compressedDataUrl = canvas.toDataURL(selectedFormat, quality);
            
            // Display compressed image
            compressedImage.src = compressedDataUrl;
            compressedImageData = compressedDataUrl;
            
            // Calculate compressed file size
            calculateCompressedSize(compressedDataUrl);
            
            // Display compressed dimensions
            compressedDimensions.textContent = `${width} x ${height}`;
            
            // Enable download button
            downloadBtn.disabled = false;
        };
        
        img.src = originalImageData;
    }

    /**
     * Calculate and display the compressed file size
     * @param {string} dataUrl - The data URL of the compressed image
     */
    function calculateCompressedSize(dataUrl) {
        // Calculate approximate file size from data URL
        // Remove the data URL prefix to get the base64 string
        const base64String = dataUrl.split(',')[1];
        const paddingSize = base64String.endsWith('==') ? 2 : (base64String.endsWith('=') ? 1 : 0);
        const fileSize = (base64String.length * 3 / 4) - paddingSize;
        
        // Display compressed size
        compressedSize.textContent = formatFileSize(fileSize);
        
        // Calculate and display reduction percentage
        const originalBytes = originalFile.size;
        const reduction = ((originalBytes - fileSize) / originalBytes) * 100;
        reductionPercentage.textContent = `${Math.round(reduction)}%`;
    }

    /**
     * Download the compressed image
     */
    function downloadImage() {
        if (!compressedImageData) return;
        
        // Create a download link
        const link = document.createElement('a');
        
        // Get file extension from format
        let extension = 'jpg'; // Default
        for (const option of formatOptions) {
            if (option.checked) {
                extension = option.value;
                break;
            }
        }
        
        // Set file name
        const fileName = `compressed_image.${extension}`;
        
        // Set link attributes
        link.href = compressedImageData;
        link.download = fileName;
        
        // Append to document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
