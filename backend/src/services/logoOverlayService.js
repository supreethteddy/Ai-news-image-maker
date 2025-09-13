import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LogoOverlayService {
  /**
   * Overlay a logo on a generated image
   * @param {string} imageUrl - URL of the generated image
   * @param {string} logoUrl - URL of the logo to overlay
   * @param {Object} options - Overlay options
   * @returns {Promise<Buffer>} - Image buffer with logo overlay
   */
  static async overlayLogo(imageUrl, logoUrl, options = {}) {
    try {
      console.log('🎨 Starting logo overlay process...');
      console.log('📸 Base image URL:', imageUrl);
      console.log('🏷️ Logo URL:', logoUrl);

      // Download the base image
      const baseImageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000 
      });
      const baseImageBuffer = Buffer.from(baseImageResponse.data);

      // Download the logo
      const logoResponse = await axios.get(logoUrl, { 
        responseType: 'arraybuffer',
        timeout: 15000 
      });
      const logoBuffer = Buffer.from(logoResponse.data);

      // Get image dimensions
      const baseImageInfo = await sharp(baseImageBuffer).metadata();
      const logoInfo = await sharp(logoBuffer).metadata();

      console.log('📐 Base image dimensions:', baseImageInfo.width, 'x', baseImageInfo.height);
      console.log('📐 Logo dimensions:', logoInfo.width, 'x', logoInfo.height);

      // Calculate logo size (10% of base image width, maintain aspect ratio)
      const logoWidth = Math.floor(baseImageInfo.width * 0.1);
      const logoHeight = Math.floor((logoWidth * logoInfo.height) / logoInfo.width);

      // Position: top-left corner with 5% margin
      const margin = Math.floor(baseImageInfo.width * 0.05);
      const left = margin;
      const top = margin;

      console.log('📏 Calculated logo size:', logoWidth, 'x', logoHeight);
      console.log('📍 Logo position:', left, ',', top);

      // Resize logo
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, logoHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png()
        .toBuffer();

      // Overlay logo on base image
      const result = await sharp(baseImageBuffer)
        .composite([
          {
            input: resizedLogo,
            left: left,
            top: top,
            blend: 'over' // Standard overlay blend mode
          }
        ])
        .png()
        .toBuffer();

      console.log('✅ Logo overlay completed successfully');
      return result;

    } catch (error) {
      console.error('❌ Error overlaying logo:', error);
      throw new Error(`Failed to overlay logo: ${error.message}`);
    }
  }

  /**
   * Save the overlaid image to a temporary file
   * @param {Buffer} imageBuffer - Image buffer with logo overlay
   * @param {string} filename - Filename for the saved image
   * @returns {Promise<string>} - Path to the saved file
   */
  static async saveOverlaidImage(imageBuffer, filename) {
    try {
      const tempDir = path.join(__dirname, '../../temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const filePath = path.join(tempDir, filename);
      await fs.writeFile(filePath, imageBuffer);
      
      console.log('💾 Overlaid image saved to:', filePath);
      return filePath;
    } catch (error) {
      console.error('❌ Error saving overlaid image:', error);
      throw new Error(`Failed to save overlaid image: ${error.message}`);
    }
  }

  /**
   * Clean up temporary files
   * @param {string} filePath - Path to the file to delete
   */
  static async cleanup(filePath) {
    try {
      await fs.unlink(filePath);
      console.log('🗑️ Temporary file cleaned up:', filePath);
    } catch (error) {
      console.log('⚠️ Failed to clean up temporary file:', error.message);
    }
  }
}

export default LogoOverlayService;
