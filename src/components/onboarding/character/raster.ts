// Rasterize a rendered character <svg> to a PNG data URI so it can flow through
// the existing avatar pipeline (AuthContext uploads data:image avatars → photoURL).

export async function svgElementToPng(svgEl: SVGSVGElement, size = 256): Promise<string> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(size));
  clone.setAttribute('height', String(size));

  const markup = new XMLSerializer().serializeToString(clone);
  const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup);

  const img = new Image();
  img.width = size;
  img.height = size;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to rasterize character SVG'));
    img.src = svgUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL('image/png');
}
