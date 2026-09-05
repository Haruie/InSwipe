import { useFit, useStore } from '../store';
import { getCompany, getJob } from '../data/catalog';
import { heldSkills } from '../lib/fit';
import { HomeIndicator, StatusBar } from '../components/PhoneFrame';
import {
  Button,
  CompanyCover,
  CompanyLogo,
  FitBar,
  FitRing,
  SectionLabel,
  VerifiedBadge,
} from '../components/ui';
import {
  IconBack,
  IconCalendar,
  IconCheck,
  IconChevron,
  IconPin,
  IconRupee,
  IconSparkle,
  IconStar,
  IconStarFilled,
} from '../components/Icons';

export function JobDetail() {
  const { state, dispatch } = useStore();
  const jobId = state.detailJobId!;
  const job = getJob(jobId);
  const company = getCompany(job.companyId);
  const fit = useFit(jobId)!;
  const held = heldSkills(state.student);
  const saved = state.saved.includes(jobId);
  const alreadyApplied = state.applications.some((a) => a.jobId === jobId);

  const met = [...job.requiredSkills, ...job.preferredSkills].filter((s) => held.has(s.toLowerCase()));
  const missing = [...job.requiredSkills, ...job.preferredSkills].filter((s) => !held.has(s.toLowerCase()));
  const isRequired = (s: string) => job.requiredSkills.includes(s);

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="absolute inset-x-0 top-0 z-20">
        <StatusBar dark />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* hero */}
        <CompanyCover company={company} className="h-[190px] shrink-0">
          <div className="absolute inset-x-0 top-[52px] flex items-center justify-between px-5">
            <button
              onClick={() => dispatch({ type: 'back' })}
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
              aria-label="Back"
            >
              <IconBack size={20} />
            </button>
            <button
              onClick={() => dispatch({ type: 'toggleSave', jobId })}
              className="press flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
              aria-label={saved ? 'Remove from saved' : 'Save'}
              style={{ color: saved ? '#F59E0B' : '#fff' }}
            >
              {saved ? <IconStarFilled size={18} /> : <IconStar size={18} />}
            </button>
          </div>
        </CompanyCover>

        {/* body */}
        <div className="relative -mt-6 rounded-t-[28px] bg-canvas px-5 pb-6 pt-5">
          <button
            onClick={() => {
              dispatch({ type: 'patch', patch: { companyId: company.id } });
              dispatch({ type: 'nav', screen: 'company' });
            }}
            className="press -mx-1 mb-3 flex w-[calc(100%+8px)] items-center gap-3 rounded-lg px-1 py-1 text-left"
          >
            <CompanyLogo initial={company.initial} color={company.color} size={40} />
            <span className="flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-ink-900">{company.name}</span>
                {company.verified && <VerifiedBadge />}
              </span>
              <span className="block text-[12px] text-ink-500">{company.industry}</span>
            </span>
            <IconChevron size={18} className="text-ink-300" />
          </button>

          <h1 className="text-[24px] font-bold leading-tight tracking-tight text-ink-900">
            {job.title}
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink-700">
            <span className="flex items-center gap-1.5">
              <IconPin size={14} /> {job.location}
            </span>
            <span>{job.workMode}</span>
            <span className="flex items-center gap-1.5">
              <IconCalendar size={14} /> {job.durationMonths} months
            </span>
            <span className="flex items-center gap-1">
              <IconRupee size={14} /> {job.stipend.toLocaleString('en-IN')}/month
            </span>
          </div>

          {/* fit block */}
          <div className="relative mt-5 overflow-hidden rounded-xl bg-white p-5 shadow-subtle">
            <span
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                padding: 1.5,
                background: 'linear-gradient(135deg,#6C5CE7,#A78BFA)',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
            <div className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-500">
              <IconSparkle size={13} /> Your fit
            </div>

            <div className="flex items-center gap-5">
              <FitRing score={fit.score} size={92} label={fit.bandLabel} />
              <div className="flex-1 space-y-2.5">
                <FitBar label="Skills" value={fit.breakdown.skills} />
                <FitBar label="Experience" value={fit.breakdown.experience} />
                <FitBar label="Interests" value={fit.breakdown.interests} />
                <FitBar label="Preferences" value={fit.breakdown.preferences} />
              </div>
            </div>

            <Button
              variant="secondary"
              full
              className="mt-4"
              onClick={() => dispatch({ type: 'patch', patch: { sheet: 'fit' } })}
            >
              See what you fit and what's missing
            </Button>
          </div>

          {/* about */}
          <section className="mt-6">
            <SectionLabel>About the role</SectionLabel>
            {job.about.split('\n\n').map((p, i) => (
              <p key={i} className="mb-2.5 text-[13.5px] leading-[1.6] text-ink-700">
                {p}
              </p>
            ))}
          </section>

          <section className="mt-5">
            <SectionLabel>What you'll do</SectionLabel>
            <ul className="space-y-2">
              {job.responsibilities.map((r) => (
                <li key={r} className="flex gap-2.5 text-[13.5px] leading-[1.5] text-ink-700">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          {/* requirements, split */}
          <section className="mt-6">
            <SectionLabel>Requirements</SectionLabel>

            <div className="rounded-lg bg-white p-4 shadow-subtle">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-fit-600">
                You meet these
              </div>
              <div className="space-y-2.5">
                {met.map((s) => (
                  <div key={s} className="flex items-center gap-2.5">
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-fit-100 text-fit-500">
                      <IconCheck size={11} strokeWidth={3.2} />
                    </span>
                    <span className="text-[13.5px] font-semibold text-ink-900">{s}</span>
                    <span className="ml-auto text-[11px] font-medium text-ink-300">
                      {isRequired(s) ? 'Required' : 'Preferred'}
                    </span>
                  </div>
                ))}
              </div>

              {missing.length > 0 && (
                <>
                  <div className="my-4 h-px bg-line" />
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gap-600">
                    You're missing these
                  </div>
                  <div className="space-y-2.5">
                    {missing.map((s) => (
                      <div key={s} className="flex items-center gap-2.5">
                        <span className="h-[15px] w-[15px] shrink-0 rounded-full border-2 border-gap-500" />
                        <span className="text-[13.5px] font-semibold text-ink-900">{s}</span>
                        <span className="ml-auto text-[11px] font-medium text-ink-300">
                          {isRequired(s) ? 'Required' : 'Preferred'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* sticky actions */}
      <div className="flex shrink-0 gap-3 border-t border-line bg-white px-5 py-3.5">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => dispatch({ type: 'toggleSave', jobId })}
        >
          {saved ? 'Saved' : 'Save'}
        </Button>
        <Button
          className="flex-[2]"
          disabled={alreadyApplied}
          onClick={() => dispatch({ type: 'openNote', jobId })}
        >
          {alreadyApplied ? 'Applied' : 'Apply'}
        </Button>
      </div>
      <HomeIndicator />
    </div>
  );
}
