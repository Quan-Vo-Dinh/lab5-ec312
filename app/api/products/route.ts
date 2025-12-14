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

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const wooCommerce = getWooCommerceClient();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "10";

    const response = await wooCommerce.get("products", {
      page: parseInt(page),
      per_page: parseInt(perPage),
    });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.headers["x-wp-total"],
      totalPages: response.headers["x-wp-totalpages"],
    });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, regular_price, images } = body;

    if (!name || !regular_price) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and regular_price are required",
        },
        { status: 400 }
      );
    }

    const wooCommerce = getWooCommerceClient();

    // Prepare product data
    interface ProductData {
      name: string;
      type: string;
      regular_price: string;
      status: string;
      images?: Array<{ src: string; name?: string; alt?: string }>;
    }

    const productData: ProductData = {
      name,
      type: "simple",
      regular_price,
      status: "publish",
    };

    // Add images if provided
    if (images && images.length > 0) {
      productData.images = images;
    }

    const response = await wooCommerce.post("products", productData);

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: unknown) {
    console.error("Error creating product:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
