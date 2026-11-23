import { useLayoutEffect, useRef, useState } from 'react';
import type { Bullet, ResumeDoc } from '../types';

/** The page is always laid out at a fixed size (680px = 8.5in, so 80px per inch) and scaled to fit the column. */
export const PAGE_W = 680;
export const PAGE_H = Math.round((PAGE_W * 11) / 8.5); // US Letter: 880px
export const LINE_H = 16; // one line of body text: 12px type (≈11pt at 80px/in) × 1.3 line height
const MARGIN = 40; // 0.5in page margin (matches px-10 / py-10)
/** Where the printable area of page 1 ends. Text below this line spills onto page 2. */
export const PAGE_LIMIT = PAGE_H - MARGIN;

interface Props {
  doc: ResumeDoc;
  /** Bullets tied to these fact ids get the evidence highlight. */
  evidenceFacts?: Set<string>;
  /** Bullet or entry currently targeted by the open suggestion. */
  targetId?: string | null;
  showChanges?: boolean;
  onBulletClick?: (b: Bullet) => void;
  /** Draw the "Page 1 ends here" line when content runs past one page. */
  showPageBreak?: boolean;
  /** Reports where the text ends (unscaled px from the top of the page) whenever it changes. */
  onMeasure?: (height: number) => void;
}

/**
 * "Calm content": the resume renders as a plain document so it looks the way it will when exported.
 * Laying it out at a fixed page width makes the one-page measurement match the export, whatever the screen width.
 */
export function ResumePaper({ doc, evidenceFacts, targetId, showChanges = true, onBulletClick, showPageBreak = false, onMeasure }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const measureCb = useRef(onMeasure);
  measureCb.current = onMeasure;
  const [box, setBox] = useState({ scale: 1, avail: PAGE_W, height: PAGE_H, textEnd: 0 });

  useLayoutEffect(() => {
    const update = () => {
      if (!outer.current || !page.current) return;
      const avail = outer.current.clientWidth;
      const height = page.current.offsetHeight;
      // Measure the text itself, not the page box (which has a minimum height and a bottom margin).
      const textEnd = content.current ? content.current.offsetTop + content.current.offsetHeight : height;
      setBox({ scale: Math.min(1, avail / PAGE_W), avail, height, textEnd });
      measureCb.current?.(textEnd);
    };
    update();
    const ro = new ResizeObserver(update);
    if (outer.current) ro.observe(outer.current);
    if (page.current) ro.observe(page.current);
    if (content.current) ro.observe(content.current);
    return () => ro.disconnect();
  }, []);

  const over = box.textEnd > PAGE_LIMIT;

  return (
    <div ref={outer} className="relative w-full" style={{ height: box.height * box.scale }}>
      <article
        ref={page}
        className="absolute top-0 rounded-sm border-[1px] border-slate-300 bg-white px-10 py-10 font-serif text-[12px] leading-[1.3] text-[#1a1a1a]"
        style={{ width: PAGE_W, minHeight: PAGE_H, left: Math.max(0, (box.avail - PAGE_W * box.scale) / 2), transform: `scale(${box.scale})`, transformOrigin: 'top left' }}
      >
        <div ref={content}>
        <header className="mb-3 text-center">
          <h1 className="text-[22px] font-bold leading-tight">{doc.name}</h1>
          <p className="mt-0.5 text-[11px] text-[#555]">{doc.contact}</p>
        </header>
        {doc.sections.map((s) => (
          <section key={s.id} className="mb-3">
            <h2 className="mb-1 border-b-[1px] border-[#999] pb-0.5 text-[11px] font-bold uppercase tracking-widest text-[#333]">{s.title}</h2>
            {s.entries.map((e) => {
              const entryTarget = targetId === e.id;
              const entryChanged = showChanges && e.changedBy;
              return (
                <div
                  key={e.id}
                  id={`r-${e.id}`}
                  className={`mb-2 rounded-sm ${entryTarget ? 'outline outline-2 outline-offset-2 outline-accent-strong' : ''} ${entryChanged ? 'bg-found-soft' : ''}`}
                >
                  {e.title && (
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold">
                        {e.title}
                        {entryChanged && <ChangeTag id={e.changedBy!} />}
                      </span>
                      <span className="shrink-0 text-[11px] italic text-[#555]">{e.meta}</span>
                    </div>
                  )}
                  <ul>
                    {e.bullets.map((b) => {
                      const isTarget = targetId === b.id;
                      const isEvidence = !!(b.factId && evidenceFacts?.has(b.factId));
                      const changed = showChanges && b.changedBy && !e.changedBy;
                      return (
                        <li
                          key={b.id}
                          id={`r-${b.id}`}
                          title={b.original ? `Was: ${b.original}` : b.factId ? `From fact ${b.factId}` : undefined}
                          onClick={onBulletClick ? () => onBulletClick(b) : undefined}
                          className={`relative rounded-sm pl-4 pr-1 transition-colors before:absolute before:left-1 before:content-['•'] ${
                            isTarget ? 'bg-accent-soft outline outline-2 outline-accent-strong' : isEvidence ? 'bg-accent-soft/70' : ''
                          } ${changed ? 'border-l-[3px] border-found-strong bg-found-soft' : ''} ${onBulletClick ? 'cursor-pointer hover:bg-[#f4f1ea]' : ''}`}
                        >
                          {b.text}
                          {changed && <ChangeTag id={b.changedBy!} />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>
        ))}
        </div>
        {showPageBreak && over && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-[#B26A00]" style={{ top: PAGE_LIMIT }}>
            <span className="absolute -top-[22px] right-2 rounded bg-partial px-1.5 font-sans text-[11px] font-bold text-ink">Page 1 ends here</span>
          </div>
        )}
      </article>
    </div>
  );
}

function ChangeTag({ id }: { id: string }) {
  return (
    <span className="ml-1.5 inline-block rounded-sm bg-found-strong px-1 align-middle font-sans text-[9px] font-semibold uppercase tracking-wide text-white">
      {id} applied
    </span>
  );
}
