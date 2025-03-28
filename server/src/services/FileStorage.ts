import { Readable } from 'stream';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger';

interface FileUploadParams {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}

interface FileMetadata {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  lastModified?: Date;
}

class FileStorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME || '';
    if (!this.bucket) {
      logger.error('AWS_BUCKET_NAME environment variable is not set');
      throw new Error('AWS_BUCKET_NAME environment variable is not set');
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'eu-north-1';

    if (!accessKeyId || !secretAccessKey) {
      logger.error('AWS credentials are not properly configured');
      throw new Error('AWS credentials are not properly configured');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    logger.info(`File storage service initialized with AWS S3 (Bucket: ${this.bucket}, Region: ${region})`);
  }

  async uploadFile({ file, fileName, mimeType, folder = 'temp' }: FileUploadParams): Promise<FileMetadata> {
    try {
      const key = folder ? `${folder}/${fileName}` : fileName;
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType
      });

      await this.s3Client.send(command);
      
      const url = await this.generatePresignedDownloadUrl(key);
      
      return {
        key,
        url,
        size: file.length,
        mimeType
      };
    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }

  async downloadFile(key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      return response.Body as Readable;
    } catch (error) {
      logger.error('Error downloading file from S3:', error);
      throw new Error('Failed to download file');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
    } catch (error) {
      logger.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      const url = await this.generatePresignedDownloadUrl(key);

      return {
        key,
        url,
        size: response.ContentLength || 0,
        mimeType: response.ContentType || 'application/octet-stream',
        lastModified: response.LastModified
      };
    } catch (error) {
      logger.error('Error getting file metadata from S3:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  async generatePresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error('Error generating presigned upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  async generatePresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error('Error generating presigned download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  async listFiles(prefix?: string): Promise<FileMetadata[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix
      });

      const response = await this.s3Client.send(command);
      const files = await Promise.all((response.Contents || []).map(async (item) => {
        const url = await this.generatePresignedDownloadUrl(item.Key || '');
        return {
          key: item.Key || '',
          url,
          size: item.Size || 0,
          mimeType: 'application/octet-stream', // S3 doesn't store ContentType in list operation
          lastModified: item.LastModified
        };
      }));

      return files;
    } catch (error) {
      logger.error('Error listing files from S3:', error);
      throw new Error('Failed to list files');
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourceKey}`,
        Key: destinationKey
      });

      await this.s3Client.send(command);
    } catch (error) {
      logger.error('Error copying file in S3:', error);
      throw new Error('Failed to copy file');
    }
  }

  async moveFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      await this.copyFile(sourceKey, destinationKey);
      await this.deleteFile(sourceKey);
    } catch (error) {
      logger.error('Error moving file in S3:', error);
      throw new Error('Failed to move file');
    }
  }
}

export default FileStorageService; 