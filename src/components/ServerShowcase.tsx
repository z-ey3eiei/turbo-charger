import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import './ServerShowcase.css';

// Adapted from the supplied Template Showcase Card & Border Beam Generator.
export function ServerShowcase() {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const command = 'npx create-ovk-app@latest my-app';
  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setMessage('คัดลอกคำสั่งแล้ว');
    } catch {
      setMessage('คัดลอกไม่ได้ กรุณาเลือกข้อความคำสั่งเพื่อคัดลอก');
    }
  }
  return (
    <section className="server-showcase" aria-label="Live template showcase">
      <div className="showcase-beam" aria-hidden="true" />
      <div className="showcase-grid" aria-hidden="true" />
      <div className="showcase-topbar">
        <span className="showcase-brand"><Terminal size={17} /> orevrkplus</span>
        <span className="showcase-preview-label">LIVE UI PREVIEW</span>
      </div>
      <div className="showcase-body">
        <div className="showcase-badge"><i /> Solutions <span>·</span> Design engineering</div>
        <h1>Design, meet <span>Engineering.</span></h1>
        <p>orevrkplus gives design engineers the whole stack — file-based routing, server functions and preview deployments — so the moment of inspiration ships without waiting on configuration.</p>
        <button type="button" className="showcase-command" onClick={copyCommand} aria-label="Copy template CLI command">
          <span aria-hidden="true">$</span><code>{command}</code>{copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <div className="showcase-terminal">
          <div className="showcase-beam" aria-hidden="true" />
          <div className="showcase-terminal-bar"><span aria-hidden="true">● ● ●</span><code>~/my-app</code><span>EXAMPLE OUTPUT</span></div>
          <div className="showcase-output">
            <div><b>$</b> {command}</div>
            <div>✓ Framework detected <span>react</span></div>
            <div>✓ Generated 12 routes from app/</div>
            <div>✓ Created 3 server functions</div>
            <div><span>Preview</span> http://localhost:3000</div>
            <div><span>Deployment</span> ready in 4.2s</div>
            <i className="showcase-cursor" aria-hidden="true" />
          </div>
        </div>
        <small>ตัวอย่างหน้าตาจากเทมเพลต · ข้อความ Terminal เป็นตัวอย่าง ไม่ใช่สถานะเซิร์ฟเวอร์จริง</small>
        <span className="sr-only" role="status">{message}</span>
      </div>
    </section>
  );
}
