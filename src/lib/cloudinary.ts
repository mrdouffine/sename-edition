import { v2 as cloudinary, type UploadApiResponse, type UploadApiErrorResponse } from "cloudinary";

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.");
  }

  return { cloud_name, api_key, api_secret };
}

export function initCloudinary() {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
  });
  return cloudinary;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: object;
  resource_type?: "image" | "video" | "raw" | "auto";
}

export interface UploadResult {
  success: boolean;
  url?: string;
  secure_url?: string;
  public_id?: string;
  error?: string;
}

export async function uploadToCloudinary(
  file: string | Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const config = getCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
    });

    const uploadOptions: Record<string, unknown> = {
      folder: options.folder || "livreo",
      resource_type: options.resource_type || "image",
    };

    if (options.public_id) {
      uploadOptions.public_id = options.public_id;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    let uploadResult: UploadApiResponse | UploadApiErrorResponse;

    if (typeof file === "string" && file.startsWith("data:")) {
      // Base64 string
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    } else if (Buffer.isBuffer(file)) {
      // Buffer
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          }
        );
        uploadStream.end(file);
      });
    } else {
      // URL
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      success: true,
      url: (uploadResult as UploadApiResponse).url,
      secure_url: (uploadResult as UploadApiResponse).secure_url,
      public_id: (uploadResult as UploadApiResponse).public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const config = getCloudinaryConfig();
    cloudinary.config({
      cloud_name: config.cloud_name,
      api_key: config.api_key,
      api_secret: config.api_secret,
    });

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch {
    return false;
  }
}

export function getCloudinaryUrl(publicId: string, options: Record<string, unknown> = {}): string {
  const config = getCloudinaryConfig();
  return cloudinary.url(publicId, {
    cloud_name: config.cloud_name,
    ...options,
  });
}

export default cloudinary;
