import { useState } from 'react';
import { useStore, type Screen } from '../store';
import { HomeIndicator, StatusBar } from '../components/PhoneFrame';
import { StepHeader } from './ResumeFlow';
import { Field } from './Onboarding';
import { Button, Chip, EmptyState, SectionLabel, Sheet, SheetHeader, Tag } from '../components/ui';
import { IconFile, IconPlus, IconSearch } from '../components/Icons';

const SKILL_POOL = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'SQL', 'PostgreSQL', 'Figma',
  'Git', 'Java', 'Flutter', 'AWS', 'Machine Learning', 'Docker', 'GraphQL', 'MongoDB',
  'Kotlin', 'Swift', 'REST APIs', 'CSS',
];

const ROLES = [
  'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 'UI/UX',
  'Product', 'Marketing', 'Finance', 'Research',
];

const LOCATIONS = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Remote'];

function Shell({
  step,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  const { dispatch } = useStore();
  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <StepHeader step={step} of={4} onBack={() => dispatch({ type: 'back' })} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-4">
        <h1 className="mt-1 text-[25px] font-bold leading-tight tracking-tight text-ink-900">
          {title}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-ink-500">{subtitle}</p>
        <div className="mt-5">{children}</div>
      </div>
      <div className="border-t border-line bg-white px-6 py-3.5">
        <Button size="lg" full onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      </div>
      <HomeIndicator />
    </div>
  );
}

export function ManualBasic() {
  const { state, dispatch } = useStore();
  const s = state.student;
  const set = (patch: Partial<typeof s>) => dispatch({ type: 'updateStudent', patch });
  return (
    <Shell
      step={1}
      title="Basic info"
      subtitle="This stays private until you apply."
      onNext={() => dispatch({ type: 'nav', screen: 'm-skills' as Screen })}
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-[22px] font-bold text-primary-500">
          {s.initial}
        </span>
        <button
          onClick={() => dispatch({ type: 'patch', patch: { toast: 'Photo upload arrives with the backend' } })}
          className="press text-[13.5px] font-semibold text-primary-500"
        >
          Add a photo (optional)
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <Field label="Full name" value={s.name} onChange={(v) => set({ name: v })} />
        <Field label="University" value={s.university} onChange={(v) => set({ university: v })} />
        <Field label="Degree" value={s.degree} onChange={(v) => set({ degree: v })} />
        <Field label="Field of study" value={s.field} onChange={(v) => set({ field: v })} />
        <div>
          <span className="mb-1.5 block text-[12px] font-semibold text-ink-500">Graduation year</span>
          <div className="flex gap-2">
            {['2025', '2026', '2027', '2028'].map((y) => (
              <Chip key={y} selected={s.gradYear === y} onClick={() => set({ gradYear: y })}>
                {y}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function ManualSkills() {
  const { state, dispatch } = useStore();
  const [q, setQ] = useState('');
  const selected = state.student.skills.map((s) => s.name);
  const pool = SKILL_POOL.filter((s) => s.toLowerCase().includes(q.toLowerCase()));

  return (
    <Shell
      step={2}
      title="Your skills"
      subtitle="Select everything you're comfortable using."
      onNext={() => dispatch({ type: 'nav', screen: 'm-projects' as Screen })}
      nextDisabled={selected.length < 3}
      nextLabel={selected.length < 3 ? `Select ${3 - selected.length} more` : 'Continue'}
    >
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
          <IconSearch size={17} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search skills…"
          className="h-11 w-full rounded-md border border-line bg-white pl-10 pr-3 text-[14px] placeholder:text-ink-300"
        />
      </div>

      {selected.length > 0 && (
        <div className="mb-5">
          <SectionLabel>Selected · {selected.length}</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((s) => (
              <button key={s} onClick={() => dispatch({ type: 'toggleSkill', skill: s })} className="press">
                <Tag kind="primary">{s} ✕</Tag>
              </button>
            ))}
          </div>
        </div>
      )}

      <SectionLabel>Popular</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {pool.map((s) => (
          <Chip
            key={s}
            selected={selected.includes(s)}
            onClick={() => dispatch({ type: 'toggleSkill', skill: s })}
          >
            {s}
          </Chip>
        ))}
        {q && !pool.length && (
          <Chip onClick={() => dispatch({ type: 'toggleSkill', skill: q })}>+ Add “{q}”</Chip>
        )}
      </div>
    </Shell>
  );
}

export function ManualProjects() {
  const { state, dispatch } = useStore();
  const projects = state.student.projects;
  const [adding, setAdding] = useState(false);
  return (
    <Shell
      step={3}
      title="Projects"
      subtitle="Show companies what you can build."
      onNext={() => dispatch({ type: 'nav', screen: 'm-prefs' as Screen })}
    >
      <AddProjectSheet open={adding} onClose={() => setAdding(false)} />
      {projects.length === 0 ? (
        <div className="h-[320px]">
          <EmptyState
            icon={<IconFile size={22} />}
            title="Add your projects"
            body="Projects are how companies see what you can actually build. Even one is a strong signal."
            action={
              <Button variant="secondary" onClick={() => setAdding(true)}>
                + Add project
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="rounded-lg bg-white p-4 shadow-subtle">
              <div className="text-[14.5px] font-bold text-ink-900">{p.name}</div>
              <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-500">{p.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <Tag key={t} kind="primary">
                    {t}
                  </Tag>
                ))}
              </div>
              {(p.github || p.demo) && (
                <div className="mt-2.5 text-[12px] font-medium text-primary-500">
                  {p.github ?? p.demo}
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() => setAdding(true)}
            className="press flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-3.5 text-[13.5px] font-semibold text-ink-500"
          >
            <IconPlus size={16} /> Add another project
          </button>
        </div>
      )}
    </Shell>
  );
}

/** A working add-project sheet — the button used to be inert. */
export function AddProjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [tech, setTech] = useState<string[]>([]);
  const [github, setGithub] = useState('');
  const [demo, setDemo] = useState('');

  const reset = () => {
    setName('');
    setDescription('');
    setTechInput('');
    setTech([]);
    setGithub('');
    setDemo('');
  };

  const addTech = () => {
    const v = techInput.trim();
    if (v && !tech.includes(v)) setTech([...tech, v]);
    setTechInput('');
  };

  const save = () => {
    dispatch({
      type: 'addProject',
      project: {
        id: `p-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        tech,
        github: github.trim() || undefined,
        demo: demo.trim() || undefined,
      },
    });
    reset();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} heightPct={88}>
      <SheetHeader title="Add project" onClose={onClose} />
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-5 pb-4">
        <Field label="Project name" value={name} onChange={setName} placeholder="MediTrack" />
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-semibold text-ink-500">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What it does, and what you built."
            className="h-[86px] w-full resize-none rounded-md border border-line bg-white p-3 text-[14px] placeholder:text-ink-300"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-[12px] font-semibold text-ink-500">Tech stack</span>
          {tech.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tech.map((t) => (
                <button key={t} onClick={() => setTech(tech.filter((x) => x !== t))} className="press">
                  <Tag kind="primary">{t} ✕</Tag>
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTech()}
              placeholder="React"
              className="h-11 flex-1 rounded-md border border-line bg-white px-3.5 text-[14px] placeholder:text-ink-300"
            />
            <Button variant="secondary" onClick={addTech} disabled={!techInput.trim()}>
              Add
            </Button>
          </div>
          <p className="mt-1.5 text-[11.5px] text-ink-300">
            Tech listed here counts as evidence and raises your fit score.
          </p>
        </div>

        <Field label="GitHub URL (optional)" value={github} onChange={setGithub} placeholder="github.com/you/project" />
        <Field label="Live demo URL (optional)" value={demo} onChange={setDemo} placeholder="project.vercel.app" />
      </div>
      <div className="border-t border-line bg-white px-5 py-3.5">
        <Button size="lg" full disabled={!name.trim() || !description.trim()} onClick={save}>
          Save project
        </Button>
      </div>
    </Sheet>
  );
}

export function ManualPrefs() {
  const { state, dispatch } = useStore();
  const p = state.student.preferences;
  const set = (patch: Partial<typeof p>) =>
    dispatch({ type: 'updateStudent', patch: { preferences: { ...p, ...patch } } });

  const toggle = <T,>(list: T[], v: T) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  return (
    <Shell
      step={4}
      title="Your preferences"
      subtitle="We use these to rank your matches."
      nextLabel="Find my opportunities"
      onNext={() => dispatch({ type: 'nav', screen: 'main' })}
    >
      <div className="space-y-6">
        <div>
          <SectionLabel>Roles you're interested in</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Chip key={r} selected={p.roles.includes(r)} onClick={() => set({ roles: toggle(p.roles, r) })}>
                {r}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Work mode</SectionLabel>
          <div className="flex gap-2">
            {(['Remote', 'Hybrid', 'On-site'] as const).map((m) => (
              <Chip key={m} selected={p.workMode === m} onClick={() => set({ workMode: m })} className="flex-1">
                {m}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Preferred locations</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {LOCATIONS.map((l) => (
              <Chip
                key={l}
                selected={p.locations.includes(l)}
                onClick={() => set({ locations: toggle(p.locations, l) })}
              >
                {l}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Internship duration</SectionLabel>
          <div className="flex gap-2">
            {[1, 2, 3, 6].map((d) => (
              <Chip
                key={d}
                selected={p.durationMonths === d}
                onClick={() => set({ durationMonths: d })}
                className="flex-1"
              >
                {d} mo
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Stipend expectation</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {[0, 5000, 10000, 20000, 30000].map((v) => (
              <Chip key={v} selected={p.minStipend === v} onClick={() => set({ minStipend: v })}>
                {v === 0 ? 'Any' : `₹${v / 1000}k+`}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
