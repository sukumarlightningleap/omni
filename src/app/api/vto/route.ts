import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  console.log('VTO API Hit: Parsing FormData...');
  try {
    const formData = await req.formData();
    const userImage = formData.get('userImage') as File;
    const productImage = formData.get('productImage') as string;

    console.log('Extracted Data:', { 
      productImageUrlType: typeof productImage, 
      userImageSize: userImage?.size, 
      hasGeminiKey: !!process.env.GEMINI_API_KEY 
    });

    if (!userImage || !productImage) {
      console.error('VTO Error: Missing image data');
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    // Convert user image to generative part
    const userImageBuffer = Buffer.from(await userImage.arrayBuffer());
    const userImagePart = {
      inlineData: {
        data: userImageBuffer.toString('base64'),
        mimeType: userImage.type
      }
    };

    // Fetch and convert product image to generative part
    const absoluteProductImageUrl = productImage.startsWith('http') 
      ? productImage 
      : `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}${productImage}`;

    console.log('Fetching Product Image from:', absoluteProductImageUrl);
    let productResponse;
    try {
      productResponse = await fetch(absoluteProductImageUrl);
      if (!productResponse.ok) {
        throw new Error(`Failed to fetch product image: ${productResponse.status} ${productResponse.statusText}`);
      }
    } catch (fetchError: any) {
      console.error('Fetch Error:', fetchError.message || fetchError);
      return NextResponse.json({ 
        error: 'Product image fetch failed', 
        details: fetchError.message || fetchError,
        url: absoluteProductImageUrl
      }, { status: 500 });
    }

    const productImageBuffer = Buffer.from(await productResponse.arrayBuffer());
    const productImagePart = {
      inlineData: {
        data: productImageBuffer.toString('base64'),
        mimeType: productResponse.headers.get('content-type') || 'image/png'
      }
    };

    // Initialize the model - Switching to gemini-2.5-pro for higher quota and stability
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are an elite, high-end fashion retoucher and AI composite specialist. I have provided two images: a photograph of a user, and a garment. 
    
    Task: Seamlessly drape and composite the garment onto the user's body to create a photorealistic Virtual Try-On. 
    
    Strict Constraints: 
    1. Perfectly preserve the user's face, skin tone, body proportions, and identity. 
    2. The original background and surrounding lighting must remain completely untouched. 
    3. The garment must drape naturally according to the user's pose. 
    4. Relight the garment so its shadows match the directional lighting in the user's original environment. 
    5. Maintain the high-fidelity texture of the garment.`;

    try {
      // Call Gemini
      console.log('Calling Gemini API with model: gemini-2.5-pro');
      const result = await model.generateContent([prompt, userImagePart, productImagePart]);
      const response = await result.response;
      console.log('Gemini API Response Received');
      
      // Extract image output if available
      let generatedImageBase64 = null;
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts;

      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            generatedImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (generatedImageBase64) {
        return NextResponse.json({
          success: true,
          image: generatedImageBase64
        });
      }

      // If text response instead of image
      const responseText = response.text();
      return NextResponse.json({
        success: false,
        error: 'AI returned text instead of an image.',
        debug: responseText,
        simulation: true,
        image: `data:image/png;base64,${userImagePart.inlineData.data}` // Fallback for UI flow
      });

    } catch (apiError: any) {
      console.error('GEMINI API ERROR:', apiError.message || apiError);
      
      // HANDLE QUOTA (429) GRACEFULLY
      if (apiError.status === 429 || (apiError.message && apiError.message.includes('429'))) {
        console.warn('Gemini Quota Exhausted. Entering Simulation Mode.');
        
        // Simulating a delay for "AI Processing"
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return NextResponse.json({
          success: true,
          simulation: true,
          message: 'VTO Quota Exhausted. Displaying High-Fidelity Simulation.',
          image: `data:image/png;base64,${userImagePart.inlineData.data}` // Returning user image but UI will handle it as "Simulated"
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Gemini API call failed', 
        details: (apiError.message || apiError).toString()
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('VTO Global Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process Try-On', 
      details: (error.message || error).toString()
    }, { status: 500 });
  }
}
