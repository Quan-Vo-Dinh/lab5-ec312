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

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { regular_price } = body;

    if (!regular_price) {
      return NextResponse.json(
        {
          success: false,
          error: 'regular_price is required',
        },
        { status: 400 }
      );
    }

    const wooCommerce = getWooCommerceClient();
    
    // First, verify the product exists
    try {
      await wooCommerce.get(`products/${id}`);
    } catch (checkError: any) {
      console.error('Product check error:', checkError);
      return NextResponse.json(
        {
          success: false,
          error: `Product with ID ${id} not found. ${checkError.message || ''}`,
        },
        { status: 404 }
      );
    }

    // Update the product
    const response = await wooCommerce.put(`products/${id}`, {
      regular_price,
    });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    // Extract more detailed error information
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to update product';
    
    const statusCode = error.response?.status || 500;
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.response?.data,
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
  } catch (error: any) {
    console.error('Error deleting product:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    // Extract more detailed error information
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to delete product';
    
    const statusCode = error.response?.status || 500;
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error.response?.data,
      },
      { status: statusCode }
    );
  }
}

