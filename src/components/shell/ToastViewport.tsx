import SwipeToast from '@/components/reactbits/SwipeToast';
import { useToast } from '@/lib/toast';

/** Terminal status tags in place of icons: [ ok ], [info], [fail]. */
const tags = {
  success: <span aria-hidden className="font-mono text-[0.75rem] font-semibold text-phosphor">[ ok ]</span>,
  info: <span aria-hidden className="font-mono text-[0.75rem] font-semibold text-chalk">[info]</span>,
  error: <span aria-hidden className="font-mono text-[0.75rem] font-semibold text-alert">[fail]</span>
};

/**
 * Renders the single active toast from useToast() with the ReactBits SwipeToast (swipe or wait for the fuse).
 * The toast card is its own role=status region, so the wrapper is not live (two regions read it twice);
 * the terminal tag is decoration (aria-hidden), so the announcement is just the title and description.
 */
export default function ToastViewport() {
  const { current, dismiss } = useToast();
  return (
    <div data-rb="SwipeToast" className="contents">
      {current && (
        <SwipeToast
          key={current.id}
          open
          onClose={dismiss}
          title={current.title}
          description={current.description}
          icon={tags[current.tone ?? 'info']}
          duration={3600}
          fuse="bottom"
          pauseOnHover
          dismissible
          closeButton
          background="#161616"
          color="#eeeeee"
          fuseColor="#808080"
          width={340}
          radius={4}
          className="font-mono text-[0.8125rem] lg:!bottom-[124px]"
        />
      )}
    </div>
  );
}
