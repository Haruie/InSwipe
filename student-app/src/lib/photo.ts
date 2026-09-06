/**
 * Turning a chosen file into a profile photo.
 *
 * The demo has no storage bucket and no auth to scope one by, so the photo is stored on
 * the student's row as a data URL (`students.avatar_url`). That is only reasonable if it
 * stays small, which is what this does: square-cropped from the centre, downscaled to
 * 256px and re-encoded as JPEG, so a 4 MB camera photo lands as a few tens of kilobytes.
 *
 * When file storage arrives the column holds a URL instead and nothing that renders it
 * has to change.
 */

const SIZE = 256;
const QUALITY = 0.82;
const MAX_INPUT_BYTES = 8 * 1024 * 1024;

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('That file is not an image.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('That image is larger than 8 MB.');
  }

  const bitmap = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not read that image.');

  // Centre crop to a square, so a portrait and a landscape photo both fill the circle.
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, SIZE, SIZE);

  return canvas.toDataURL('image/jpeg', QUALITY);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    image.src = url;
  });
}
