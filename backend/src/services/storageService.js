import { supabase } from '../lib/supabase.js';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUCKET_NAME = 'staiblstoryboard';

class StorageService {
  constructor() {
    this.bucketName = BUCKET_NAME;
  }

  // Initialize bucket if it doesn't exist
  async initializeBucket() {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return false;
      }

      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${this.bucketName}`);
        const { data, error } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
          return false;
        }
        
        console.log('✅ Bucket created successfully:', data);
      } else {
        console.log(`✅ Bucket ${this.bucketName} already exists`);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing bucket:', error);
      return false;
    }
  }

  // Upload file from buffer
  async uploadFromBuffer(buffer, filePath, contentType = 'image/jpeg') {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType,
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.error('Error uploading to Supabase Storage:', error);
        return { success: false, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return {
        success: true,
        path: data.path,
        publicUrl: urlData.publicUrl,
        fullPath: data.fullPath
      };
    } catch (error) {
      console.error('Error in uploadFromBuffer:', error);
      return { success: false, error };
    }
  }

  // Upload file from local path
  async uploadFromPath(localPath, filePath, contentType = 'image/jpeg') {
    try {
      const fileBuffer = await fs.readFile(localPath);
      return await this.uploadFromBuffer(fileBuffer, filePath, contentType);
    } catch (error) {
      console.error('Error reading file for upload:', error);
      return { success: false, error };
    }
  }

  // Upload from URL (download first, then upload)
  async uploadFromUrl(url, filePath, contentType = 'image/jpeg') {
    try {
      console.log(`Downloading image from: ${url}`);
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const buffer = Buffer.from(response.data);
      return await this.uploadFromBuffer(buffer, filePath, contentType);
    } catch (error) {
      console.error('Error downloading and uploading from URL:', error);
      return { success: false, error };
    }
  }

  // Delete file from storage
  async deleteFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting from Supabase Storage:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error in deleteFile:', error);
      return { success: false, error };
    }
  }

  // Get public URL for a file
  getPublicUrl(filePath) {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // List files in a folder
  async listFiles(folderPath = '') {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath);

      if (error) {
        console.error('Error listing files:', error);
        return { success: false, error };
      }

      return { success: true, files: data };
    } catch (error) {
      console.error('Error in listFiles:', error);
      return { success: false, error };
    }
  }

  // Generate unique file path
  generateFilePath(type, userId, filename) {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(filename) || '.jpg';
    const baseName = path.basename(filename, extension);
    
    return `${type}/${userId}/${timestamp}-${randomId}-${baseName}${extension}`;
  }

  // Upload character image
  async uploadCharacterImage(imageUrl, userId, characterName) {
    const filePath = this.generateFilePath('characters', userId, `${characterName}.jpg`);
    return await this.uploadFromUrl(imageUrl, filePath, 'image/jpeg');
  }

  // Upload storyboard image
  async uploadStoryboardImage(imageUrl, userId, storyboardId, sceneIndex) {
    const filePath = this.generateFilePath('storyboards', userId, `storyboard-${storyboardId}-scene-${sceneIndex}.jpg`);
    return await this.uploadFromUrl(imageUrl, filePath, 'image/jpeg');
  }

  // Upload storyboard image from local file
  async uploadStoryboardImageFromPath(localPath, userId, storyboardId, sceneIndex, contentType = 'image/png') {
    const filePath = this.generateFilePath('storyboards', userId, `storyboard-${storyboardId}-scene-${sceneIndex}.png`);
    return await this.uploadFromPath(localPath, filePath, contentType);
  }

  // Upload styling template logo
  async uploadStylingLogo(imageUrl, userId, templateName) {
    const filePath = this.generateFilePath('styling-templates', userId, `${templateName}-logo.jpg`);
    return await this.uploadFromUrl(imageUrl, filePath, 'image/jpeg');
  }

  // Upload user uploaded file
  async uploadUserFile(localPath, userId, originalName, type = 'uploads') {
    const filePath = this.generateFilePath(type, userId, originalName);
    const contentType = this.getContentType(originalName);
    return await this.uploadFromPath(localPath, filePath, contentType);
  }

  // Get content type from filename
  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return contentTypes[ext] || 'image/jpeg';
  }

  // Clean up old files (optional utility)
  async cleanupOldFiles(folderPath, maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const { data: files, error } = await this.listFiles(folderPath);
      
      if (error) return { success: false, error };

      const now = Date.now();
      const filesToDelete = [];

      for (const file of files) {
        const fileAge = now - new Date(file.created_at).getTime();
        if (fileAge > maxAge) {
          filesToDelete.push(file.name);
        }
      }

      if (filesToDelete.length > 0) {
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .remove(filesToDelete.map(name => `${folderPath}/${name}`));

        if (error) {
          console.error('Error cleaning up files:', error);
          return { success: false, error };
        }

        console.log(`Cleaned up ${filesToDelete.length} old files`);
        return { success: true, deletedCount: filesToDelete.length };
      }

      return { success: true, deletedCount: 0 };
    } catch (error) {
      console.error('Error in cleanupOldFiles:', error);
      return { success: false, error };
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

// Initialize bucket on startup
storageService.initializeBucket().then(success => {
  if (success) {
    console.log('✅ Supabase Storage initialized successfully');
  } else {
    console.log('❌ Failed to initialize Supabase Storage');
  }
});

export default storageService;
