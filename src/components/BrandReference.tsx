import { useRef, useState } from 'react';
import { TurborepoLogo } from '../apps/docs/components/logos-and-testimonials';

const COLORS = ['#FF1E56', '#A853BA', '#0096FF', '#0A0A0A', '#EDEDED'];
const GRADIENT = 'linear-gradient(110deg, #FF1E56 0%, #A853BA 48%, #0096FF 100%)';

export function BrandReference() {
  const logo = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState('');
  const [monochrome, setMonochrome] = useState(false);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(`Copied: ${value}`);
    } catch {
      setFeedback('คัดลอกไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกด้วยตัวเอง');
    }
  }

  function downloadLogo() {
    const original = logo.current?.querySelector('svg');
    if (!original) return;
    const svg = original.cloneNode(true) as SVGSVGElement;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    // Resolve theme-dependent fills so the downloaded SVG is standalone.
    const sourceNodes = [original, ...original.querySelectorAll('*')];
    const targetNodes = [svg, ...svg.querySelectorAll('*')];
    sourceNodes.forEach((source, index) => {
      if (source.hasAttribute('class')) {
        targetNodes[index].setAttribute('fill', getComputedStyle(source).fill);
        targetNodes[index].removeAttribute('class');
      }
    });
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `turborepo-reference-${monochrome ? 'mono' : 'color'}.svg`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section aria-labelledby="brand-reference" className="my-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-background-100 p-5 sm:p-6 space-y-5">
      <div>
        <h2 id="brand-reference" className="text-xl font-semibold">Brand &amp; Color Reference</h2>
        <p className="mt-2 text-sm text-gray-900">สีและสัญลักษณ์ที่ใช้อยู่ในเว็บนี้ คลิกสีเพื่อคัดลอกรหัส หรือดาวน์โหลด SVG ตัวอย่าง สัญลักษณ์ Turborepo เป็นของแบรนด์ต้นฉบับ</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 dark:border-neutral-800 p-5 space-y-4">
          <div ref={logo} className="flex flex-wrap items-center gap-4">
            <TurborepoLogo className="h-12 w-12" monochrome={monochrome} />
            <span className="sidename text-2xl">Turbocharger</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={monochrome} onClick={() => setMonochrome(!monochrome)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">{monochrome ? 'Show color' : 'Show monochrome'}</button>
            <button type="button" onClick={downloadLogo} className="rounded-md border border-gray-300 px-3 py-2 text-sm">Download SVG</button>
          </div>
        </div>
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <button key={color} type="button" onClick={() => copy(color)} aria-label={`Copy ${color}`} className="rounded-md border border-gray-300 overflow-hidden">
                <span className="block h-10 w-full" style={{ background: color }} />
                <span className="block px-2 py-2 text-xs font-mono">{color}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => copy(`background: ${GRADIENT};`)} className="w-full rounded-md border border-gray-300 overflow-hidden text-left">
            <span className="block h-8" style={{ background: GRADIENT }} />
            <span className="block p-2 text-sm">Copy gradient CSS</span>
          </button>
        </div>
      </div>
      <p role="status" className="min-h-5 text-xs text-gray-900 break-all">{feedback}</p>
    </section>
  );
}
