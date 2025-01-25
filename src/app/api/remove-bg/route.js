import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('image');
  const color = formData.get('color');

  if (!file) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
  }

  if (!color) {
    return NextResponse.json({ error: 'No color provided' }, { status: 400 });
  }

  try {
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const image = sharp(imageBuffer);

    const backgroundColor = color.match(/\w\w/g).map((c) => parseInt(c, 16));

    // Create a mask based on color similarity
    const { data: rawImage } = await image.raw().toBuffer({ resolveWithObject: true });
    const { width, height, channels } = await image.metadata();

    // Helper function to calculate Euclidean distance
    const colorDistance = (color1, color2) => {
      return Math.sqrt(
        color1.reduce((sum, value, index) => sum + Math.pow(value - color2[index], 2), 0)
      );
    };

    // Create a mask where the background color is detected
    const mask = Buffer.alloc(width * height, 0);
    for (let i = 0; i < rawImage.length; i += channels) {
      const pixelColor = [rawImage[i], rawImage[i + 1], rawImage[i + 2]];
      const isBackground = colorDistance(pixelColor, backgroundColor) < 50;
      mask[i / channels] = isBackground ? 0 : 255;
    }

    // Apply the mask to the image
    const transparentImageBuffer = await sharp(imageBuffer)
      .joinChannel(mask, { raw: { width, height, channels: 1 } })
      .png()
      .toBuffer();

    return new Response(transparentImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="processed-image.png"',
      },
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
  }
}