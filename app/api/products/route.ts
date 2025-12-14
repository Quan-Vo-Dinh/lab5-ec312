import { NextRequest, NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API client
function getWooCommerceClient() {
  const url = process.env.NEXT_PUBLIC_WC_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!url || !consumerKey || !consumerSecret) {
    throw new Error('Missing WooCommerce configuration in environment variables');
  }

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: 'wc/v3',
  });
}

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const wooCommerce = getWooCommerceClient();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '10';

    const response = await wooCommerce.get('products', {
      page: parseInt(page),
      per_page: parseInt(perPage),
    });

    return NextResponse.json({
      success: true,
      data: response.data,
      total: response.headers['x-wp-total'],
      totalPages: response.headers['x-wp-totalpages'],
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, regular_price } = body;

    if (!name || !regular_price) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and regular_price are required',
        },
        { status: 400 }
      );
    }

    const wooCommerce = getWooCommerceClient();
    const response = await wooCommerce.post('products', {
      name,
      type: 'simple',
      regular_price,
      status: 'publish',
    });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create product',
      },
      { status: 500 }
    );
  }
}

