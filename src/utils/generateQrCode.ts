import * as path from 'path';
import * as qrcode from 'qrcode';
import * as Jimp from 'jimp';

export async function generateQrCode(
  id: string,
  name: string,
  address: string,
): Promise<string> {
  const qrData = `${id}`;
  const filePath = path.join(
    __dirname,
    '..',
    'public',
    'qrcodes',
    `${id}-${address}.png`,
  );

  try {
    // Generate QR code image with specified size
    const qrImage = await qrcode.toBuffer(qrData, {
      type: 'png',
      margin: 1,
      width: 150,
    });

    // Load QR code image using Jimp
    const qrJimp = await Jimp.read(qrImage);

    // Create a new image with space for the QR code and text
    const width = qrJimp.bitmap.width;
    const height = qrJimp.bitmap.height + 60; // Additional space for text
    const image = new Jimp(width, height, 0xffffffff);

    // Composite the QR code onto the new image
    image.composite(qrJimp, 0, 0);

    // Load font for text (using bold variant)
    const fontBold = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    // Calculate text position to center it
    const textWidth = Jimp.measureText(fontBold, `${name}`);
    const textX = (width - textWidth) / 2;
    const textY = qrJimp.bitmap.height + 10; // Adjust vertical position

    // Add name centered below the QR code
    image.print(fontBold, textX, textY, `${name}`);

    // Calculate address position to center it
    const addressWidth = Jimp.measureText(fontBold, `${address}`);
    const addressX = (width - addressWidth) / 2;
    const addressY = textY + 20; // Adjust vertical position

    // Add address centered below the name
    image.print(fontBold, addressX, addressY, `${address}`);

    // Save the final image
    await image.writeAsync(filePath);

    return filePath;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}
