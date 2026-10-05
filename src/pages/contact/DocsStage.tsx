import { useEffect, useRef } from 'react';
import FolderFloat, { type FolderFloatItem } from '@/components/reactbits/FolderFloat';
import RB from '@/components/ui/RB';
import { useReducedMotion } from '@/lib/motion';
import { isLowPowerDevice, useFinePointer } from '@/lib/media';
import { documents } from './shared';

/**
 * The ~/docs folder (desktop only, its own lazy chunk so matter-js never ships to phones): the two
 * real documents spring out of a ReactBits FolderFloat and, with a mouse, float on matter-js physics
 * and can be dragged. The parent mounts it only while it is on screen.
 */
export default function DocsStage() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const stageRef = useRef<HTMLDivElement>(null);

  // The folder opens by itself the first time it is seen (its own button, so its state stays in sync).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => stage.querySelector<HTMLButtonElement>('button[aria-expanded="false"]')?.click(), reduced ? 0 : 400);
      },
      { threshold: 0.6 }
    );
    io.observe(stage);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduced]);

  const items: FolderFloatItem[] = documents.map((d) => ({ label: d.name, value: d.name, href: d.href, external: true }));

  return (
    <div ref={stageRef} className="relative flex h-full items-end justify-center">
      <RB name="FolderFloat" className="relative">
        <FolderFloat
          items={items}
          label="~/docs"
          sublabel={`${items.length} files`}
          trigger="click"
          closeOnSelect={false}
          physics={fine && !isLowPowerDevice()}
          reduceMotion={reduced}
          folderColor="#1f1f1f"
          frontColor="#2a2a2a"
          paperColor="#e8e8e8"
          itemColor="#eeeeee"
          itemTextColor="#060606"
          labelColor="#eeeeee"
          radius={4}
          width={220}
          height={160}
          spread={200}
          lift={28}
          tilt={6}
          className="font-mono"
        />
      </RB>
    </div>
  );
}
