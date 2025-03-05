import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function GET() {
  return NextResponse.json({ message: "hello world" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, steps = 50 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const image = await hf.textToImage({
      model: "stabilityai/stable-diffusion-2",
      inputs: prompt,
      parameters: {
        negative_prompt: "blurry, bad quality, worst quality, low quality",
        num_inference_steps: steps,
      }
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

  } catch (error: Error | unknown) {
    console.error('Image generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
