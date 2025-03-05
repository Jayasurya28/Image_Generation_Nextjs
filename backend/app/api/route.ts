import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function GET() {
  return NextResponse.json({ message: "hello world" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, steps = 5 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const image = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
      parameters: { num_inference_steps: steps },
      provider: "replicate",
    });

    // Convert the Blob to an ArrayBuffer
    const arrayBuffer = await image.arrayBuffer();

    // Create a Response with the image data
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
