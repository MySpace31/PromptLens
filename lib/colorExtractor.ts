/**
 * Utility to extract dominant color hex codes from an image element or Data URL using HTML Canvas
 */
export async function extractImageColors(imageSrc: string, count: number = 5): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(['#6366F1', '#A855F7', '#3B82F6', '#10B981', '#F59E0B']);
          return;
        }

        // Downsample for fast processing
        const width = 100;
        const height = Math.floor((img.height / img.width) * width) || 100;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height).data;

        const colorCounts: Record<string, number> = {};

        // Sample every 4 pixels (r,g,b,a)
        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue; // Ignore transparent pixels

          // Quantize color to reduce noise
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;

          const hex = `#${((1 << 24) + (Math.min(255, qr) << 16) + (Math.min(255, qg) << 8) + Math.min(255, qb)).toString(16).slice(1).toUpperCase()}`;
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sortedColors = Object.keys(colorCounts)
          .sort((a, b) => colorCounts[b] - colorCounts[a])
          .slice(0, count);

        if (sortedColors.length === 0) {
          resolve(['#6366F1', '#A855F7', '#3B82F6', '#10B981', '#F59E0B']);
        } else {
          resolve(sortedColors);
        }
      } catch (err) {
        console.error("Color extraction failed:", err);
        resolve(['#6366F1', '#A855F7', '#3B82F6', '#10B981', '#F59E0B']);
      }
    };

    img.onerror = () => {
      resolve(['#6366F1', '#A855F7', '#3B82F6', '#10B981', '#F59E0B']);
    };

    img.src = imageSrc;
  });
}
