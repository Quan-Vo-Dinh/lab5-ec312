import { NextRequest, NextResponse } from "next/server";
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Initialize WooCommerce API client
function getWooCommerceClient() {
  const url = process.env.NEXT_PUBLIC_WC_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!url || !consumerKey || !consumerSecret) {
    throw new Error(
      "Missing WooCommerce configuration in environment variables"
    );
  }

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: "wc/v3",
  });
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { regular_price, images } = body;

    if (!regular_price && !images) {
      return NextResponse.json(
        {
          success: false,
          error: "regular_price or images is required",
        },
        { status: 400 }
      );
    }

    const wooCommerce = getWooCommerceClient();

    // First, verify the product exists
    try {
      await wooCommerce.get(`products/${id}`);
    } catch (checkError: unknown) {
      console.error("Product check error:", checkError);
      const errorMsg = checkError instanceof Error ? checkError.message : "";
      return NextResponse.json(
        {
          success: false,
          error: `Product with ID ${id} not found. ${errorMsg}`,
        },
        { status: 404 }
      );
    }

    // Prepare update data
    interface UpdateData {
      regular_price?: string;
      images?: Array<{ src: string; name?: string; alt?: string }>;
    }

    const updateData: UpdateData = {};
    if (regular_price) {
      updateData.regular_price = regular_price;
    }
    if (images) {
      updateData.images = images;
    }

    // Update the product
    const response = await wooCommerce.put(`products/${id}`, updateData);

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: unknown) {
    console.error("Error updating product:", error);

    interface ErrorResponse {
      message?: string;
      error?: string;
    }

    interface ApiError extends Error {
      response?: {
        data?: ErrorResponse;
        status?: number;
        statusText?: string;
      };
    }

    const apiError = error as ApiError;

    console.error("Error details:", {
      message: apiError.message,
      response: apiError.response?.data,
      status: apiError.response?.status,
      statusText: apiError.response?.statusText,
    });

    // Extract more detailed error information
    const errorMessage =
      apiError.response?.data?.message ||
      apiError.response?.data?.error ||
      apiError.message ||
      "Failed to update product";

    const statusCode = apiError.response?.status || 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: apiError.response?.data,
      },
      { status: statusCode }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const wooCommerce = getWooCommerceClient();

    // Delete with force=true to permanently delete
    const response = await wooCommerce.delete(`products/${id}`, {
      force: true,
    });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: unknown) {
    interface ErrorResponse {
      message?: string;
      error?: string;
    }

    interface ApiError extends Error {
      response?: {
        data?: ErrorResponse;
        status?: number;
        statusText?: string;
      };
    }

    const apiError = error as ApiError;

    console.error("Error deleting product:", apiError);
    console.error("Error details:", {
      message: apiError.message,
      response: apiError.response?.data,
      status: apiError.response?.status,
      statusText: apiError.response?.statusText,
    });

    // Extract more detailed error information
    const errorMessage =
      apiError.response?.data?.message ||
      apiError.response?.data?.error ||
      apiError.message ||
      "Failed to delete product";

    const statusCode = apiError.response?.status || 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: apiError.response?.data,
      },
      { status: statusCode }
    );
  }
}
