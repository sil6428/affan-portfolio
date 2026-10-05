import { profile } from '@/data/profile';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';
import RB from '@/components/ui/RB';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import { CmdLink, Prompt } from './fx';

/** One sentence on how the work is documented; the rules behind it live on /about. */
export default function ThesisSection() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();

  return (
    <section id="thesis" aria-labelledby="thesis-title" className="relative scroll-mt-16 py-16 md:py-20">
      <div className="container-signal">
        <Prompt path="~" cmd="cat thesis.txt" decorative />
        <h2 id="thesis-title" className="sr-only">
          Thesis
        </h2>

        {/* The one effect here: the sentence brightens word by word as it scrolls through. The resting
            grey is the card-word grey and still passes AA, so nothing is unreadable before it reveals. */}
        <RB name="ScrollReveal" as="figure" className="mt-8 md:mt-10">
          <ScrollReveal
            as="blockquote"
            disabled={reduced}
            baseOpacity={0.52}
            enableBlur={false}
            baseRotation={0}
            wordAnimationEnd={mobile ? 'bottom 70%' : 'bottom 60%'}
            containerClassName="my-0!"
            textClassName="max-w-[34ch] text-[clamp(1.625rem,3.9vw,3.5rem)]! leading-[1.12]! font-semibold tracking-[-0.03em] text-fg"
          >
            {profile.thesis}
          </ScrollReveal>
        </RB>

        <CmdLink to="/about#how-i-work" path="~/whoami" label="how I work" className="mt-8 md:mt-10" />
      </div>
    </section>
  );
}
