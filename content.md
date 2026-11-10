# content.md — แบบกำหนดการและชุดคำสั่ง AI ฉบับเต็มสำหรับโครงการ ai-sdk.pro

## 1. วิธีใช้เอกสารนี้ (วิธีสั่ง AI)

เอกสารนี้ออกแบบให้วางลงใน repository เป็นไฟล์ชื่อ `content.md` (หรือคัดลอกเนื้อหาไปรวมไว้ใน `AGENTS.md` / `CLAUDE.md` / `.cursorrules` ก็ได้ เพราะเครื่องมือเหล่านั้นอ่านไฟล์กำกับนโยบายระดับ repository โดยอัตโนมัติ) หลักการสั่งงาน AI มีห้าข้อ:

1. สั่งทีละเฟส ไม่สั่งทั้งโครงการในครั้งเดียว เพราะ AI ทำงานได้ดีที่สุดเมื่อขอบเขตหนึ่งคำสั่งมีขนาดพอที่จะตรวจสอบได้
2. ก่อนเริ่มแต่ละเฟส ให้วางข้อความจากส่วน "คำสั่งสำเร็จรูป" ของเฟสนั้นลงในหน้าต่างสนทนาของ AI ได้โดยตรง
3. หลัง AI แจ้งเสร็จแต่ละเฟส ให้สั่งตรวจรับด้วยเกณฑ์ที่กำหนดไว้ท้ายเฟสนั้น หากไม่ผ่านให้ส่งคำสั่งแก้ไขจากส่วน 8
4. ห้ามส่งคีย์หรือข้อมูลลับใดในคำสั่ง AI ทุกค่าที่เป็นความลับต้องเข้าผ่านไฟล์ `.env` บนเครื่องเท่านั้น
5. คำสั่งสำเร็จรูปเขียนเป็นภาษาอังกฤษเพราะโมเดลเขียนโค้ดทำงานได้เสถียรที่สุด ส่วนคำอธิบายรอบ ๆ เป็นภาษาไทยเพื่อให้ผู้ดูแลเข้าใจ

## 2. บริบทโครงการ

โครงการ ai-sdk.pro คือเว็บไซต์เปิดสาธารณะบน VPS ที่นำเสนอและให้บริการ AI agents ตามแนวทาง Vercel AI SDK 6 โดยมีองค์ประกอบหลักสี่ด้าน:

1. เว็บแอปพลิเคชัน Next.js ที่มี chat endpoint รองรับ streaming และ agent ที่นิยามด้วย ToolLoopAgent
2. เอกสาร (docs) ที่มีดีไซน์และโครงเรื่องแบบ turborepo.dev สร้างด้วย Fumadocs
3. client SDK ที่เผยแพร่เป็นแพ็กเกจ npm เพื่อให้นักพัฒนานำไปต่อกับ endpoint ของเว็บ
4. สายการดีพลอยจาก Git: การ push ไปยัง branch หลักต้องส่งผลให้เว็บบน VPS ปรับปรุงอัตโนมัติ (ผ่าน Coolify หรือ GitHub Actions + Docker + Caddy)

ข้อกำหนดตายตัว: ระบบรันบน VPS ที่ผู้ใช้ดูแลเอง ไม่ผูกติดกับแพลตฟอร์ม Vercel และทุกคีย์ของผู้ให้บริการโมเดลต้องอยู่เฉพาะฝั่งเซิร์ฟเวอร์

## 3. สถาปัตยกรรมและเทคโนโลยีที่กำหนดไว้ล่วงหน้า

| ส่วนประกอบ | เทคโนโลยีที่เลือก | เหตุผล |
| --- | --- | --- |
| Monorepo | pnpm workspaces + Turborepo | จัดการ apps และ packages ร่วมกัน สอดคล้องแนวทาง turborepo.dev |
| เว็บแอป | Next.js (App Router) + TypeScript | รองรับ route handler และ standalone output สำหรับ Docker |
| AI layer | `ai` (Vercel AI SDK 6) + `@ai-sdk/mcp` | ToolLoopAgent, tools, streaming ครบชุด |
| Client SDK | `@ai-sdk/react` useChat + custom transport | สอดคล้องโปรโตคอล UIMessage stream |
| เอกสาร | Fumadocs (MDX) | ปรับแต่งดีไซน์แบบ shadcn ได้อิสระ รองรับ RSC |
| ดีไซน์ | Tailwind CSS v4 + โทเคนดีไซน์แบบ turborepo.dev | ดูหัวข้อ 6.4 |
| การบรรจุ | Docker (Next.js standalone) | ใช้งานบน VPS ใดก็ได้ |
| Reverse proxy | Caddy (หรือ Traefik หากใช้ Coolify) | HTTPS อัตโนมัติ ไม่ buffer สตรีมโดยค่าปริยาย |
| การดีพลอย | Coolify หรือ GitHub Actions + GHCR + docker compose | deploy จาก git push โดยตรง |

## 4. โครงสร้าง repository เป้าหมาย

```text
ai-sdk-pro/
├─ apps/
│  ├─ web/                  # เว็บหลัก (Next.js): landing + chat + playground
│  │  ├─ app/
│  │  │  ├─ page.tsx        # หน้าแรกแบบ turborepo.dev
│  │  │  ├─ chat/page.tsx   # หน้าแชทใช้ useChat
│  │  │  └─ api/chat/route.ts
│  │  ├─ agents/            # หรือวางที่ lib/agents ก็ได้ตามที่ AI เสนอ
│  │  │  ├─ assistant-agent.ts
│  │  │  └─ tools/
│  │  └─ next.config.ts     # output: 'standalone'
│  └─ docs/                 # เอกสารด้วย Fumadocs
│     └─ content/docs/*.mdx
├─ packages/
│  ├─ ui/                   # คอมโพเนนต์ร่วม (ปุ่ม การ์ด บล็อกโค้ด)
│  └─ sdk/                  # client SDK สำหรับเผยแพร่ npm (@aisdkpro/client)
├─ infra/
│  ├─ Dockerfile
│  ├─ docker-compose.yml
│  └─ Caddyfile
├─ turbo.json
├─ pnpm-workspace.yaml
├─ content.md               # เอกสารนี้
└─ .github/workflows/deploy.yml
```

## 5. กฎเหล็กที่ AI ต้องปฏิบัติทุกเฟส

```text
RULES (apply to every task in this repository):
1. Never commit secrets, API keys, or .env files. Use environment variables only.
2. All LLM provider keys and agent logic must stay server-side. Nothing sensitive in client bundles.
3. Use TypeScript strict mode. No `any` in exported APIs.
4. Follow the exact directory structure in content.md section 4 unless I approve a change.
5. After finishing each phase, list the files created/changed and how to verify locally.
6. If a required dependency version conflicts with another, stop and ask me instead of guessing.
7. Every streaming-related change must keep SSE working end-to-end (no buffering anywhere in the path).
```
