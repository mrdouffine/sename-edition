import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = requireAuth(request);
    
    if (!session.sub) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { image, folder = "livreo", publicId } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Validate image data URL
    if (!image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image format. Expected base64 data URL" },
        { status: 400 }
      );
    }

    const result = await uploadToCloudinary(image, {
      folder,
      public_id: publicId,
    });

    if (!result.success || !result.secure_url) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = requireAuth(request);
    
    if (!session.sub) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteFromCloudinary(publicId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete image" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Image delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
