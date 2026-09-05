import { useState } from 'react';
import { useStore } from '../store';
import { getJob } from '../data/jobs';
import { getCompany } from '../data/companies';
import { computeFit, learningList } from '../lib/fit';
import { allJobs } from '../store';
import { AppHeader } from '../components/AppHeader';
import { Field } from './Onboarding';
import { AddProjectSheet } from './ManualFlow';
import {
  Button,
  CompanyLogo,
  EmptyState,
  FitPill,
  SectionLabel,
  StatusTag,
  Tag,
} from '../components/ui';
import {
  IconChevron,
  IconClose,
  IconEdit,
  IconFile,
  IconStar,
  IconTrend,
} from '../components/Icons';

/* ----------------------------- Applications ----------------------------- */

const APP_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'selected', label: 'Selected' },
  { key: 'rejected', label: 'Not selected' },
] as const;

type AppFilter = (typeof APP_FILTERS)[number]['key'];

export function Applications() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<AppFilter>('all');

  const all = [...state.applications].sort((a, b) => b.appliedOrder - a.appliedOrder);
  const selectedCount = all.filter((a) => a.status === 'selected').length;
  const rejectedCount = all.filter((a) => a.status === 'rejected').length;

  const apps = all.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'selected') return a.status === 'selected';
    if (filter === 'rejected') return a.status === 'rejected';
    return a.status !== 'rejected' && a.status !== 'selected';
  });

  const counts: Record<AppFilter, number> = {
    all: all.length,
    active: all.filter((a) => a.status !== 'rejected' && a.status !== 'selected').length,
    selected: selectedCount,
    rejected: rejectedCount,
  };

  return (
    <div className="flex h-full flex-col">
      <AppHeader />
      <div className="px-5 pb-2.5">
        <h1 className="text-[21px] font-bold tracking-tight text-ink-900">Applications</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-500">
          {all.length} application{all.length === 1 ? '' : 's'} · {selectedCount} selected ·{' '}
          {rejectedCount} not selected
        </p>
      </div>

      {all.length > 0 && (
        <div className="mb-1 flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3">
          {APP_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`press shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                filter === f.key
                  ? 'border-primary-500 bg-primary-100 text-primary-500'
                  : 'border-line bg-white text-ink-500'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-ink-300">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      )}

      {all.length === 0 ? (
        <EmptyState
          icon={<IconFile size={22} />}
          title="No applications yet"
          body="Swipe right on opportunities you want. Applications and their status appear here."
          action={
            <Button onClick={() => dispatch({ type: 'tab', tab: 'discover' })}>Start swiping</Button>
          }
        />
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar px-5 pb-4">
          {apps.map((a) => {
            const job = getJob(a.jobId);
            const company = getCompany(job.companyId);
            const isSelected = a.status === 'selected';
            const isRejected = a.status === 'rejected';
            return (
              // A div wrapper, not a button — "Open chat" is a real button and nesting
              // one inside another is invalid and unreachable by keyboard.
              <div
                key={a.jobId}
                className="overflow-hidden rounded-lg bg-white shadow-subtle"
                style={{
                  borderLeft: isSelected ? '3px solid #16A34A' : '3px solid transparent',
                  opacity: isRejected ? 0.68 : 1,
                }}
              >
                <button
                  onClick={() => {
                    dispatch({ type: 'patch', patch: { appDetailJobId: a.jobId } });
                    dispatch({ type: 'nav', screen: 'appDetail' });
                  }}
                  className="press block w-full p-3.5 text-left"
                >
                  <div className="flex items-start gap-3">
                  <CompanyLogo initial={company.initial} color={company.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-bold text-ink-900">
                        {company.name}
                      </span>
                      {a.note && (
                        <span
                          title="You sent a note with this application"
                          className="shrink-0 rounded-sm bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-300"
                        >
                          Note
                        </span>
                      )}
                    </div>
                    <div className="truncate text-[12.5px] text-ink-500">{job.title}</div>
                    <div className="mt-1 text-[11.5px] text-ink-300">{a.appliedLabel}</div>
                  </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <FitPill score={a.fitSnapshot} />
                      <StatusTag status={a.status} />
                    </div>
                  </div>
                </button>

                {isSelected && (
                  <div className="mx-3.5 flex items-center justify-between border-t border-line py-2.5">
                    <span className="text-[12px] font-semibold text-fit-600">They want to talk</span>
                    <button
                      onClick={() => {
                        dispatch({ type: 'patch', patch: { chatJobId: a.jobId } });
                        dispatch({ type: 'readConversation', jobId: a.jobId });
                        dispatch({ type: 'nav', screen: 'chat' });
                      }}
                      className="press rounded-md bg-primary-500 px-3 py-1.5 text-[12px] font-semibold text-white"
                    >
                      Open chat
                    </button>
                  </div>
                )}
                {isRejected && (
                  <button
                    onClick={() => dispatch({ type: 'tab', tab: 'discover' })}
                    className="press mx-3.5 block border-t border-line py-2.5 text-[12px] font-semibold text-primary-500"
                  >
                    See similar roles →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Saved -------------------------------- */

export function Saved() {
  const { state, dispatch } = useStore();
  const saved = state.saved;

  return (
    <div className="flex h-full flex-col">
      <AppHeader />
      <div className="px-5 pb-3">
        <h1 className="text-[21px] font-bold tracking-tight text-ink-900">Saved</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-500">
          {saved.length} {saved.length === 1 ? 'opportunity' : 'opportunities'} starred
        </p>
      </div>

      {saved.length === 0 ? (
        <EmptyState
          icon={<IconStar size={22} />}
          title="Nothing saved yet"
          body="Tap the star on any card to keep it for later. Your shortlist lives here."
          action={
            <Button variant="secondary" onClick={() => dispatch({ type: 'tab', tab: 'discover' })}>
              Back to discover
            </Button>
          }
        />
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto no-scrollbar px-5 pb-4">
          {saved.map((id) => {
            const job = getJob(id);
            const company = getCompany(job.companyId);
            const fit = computeFit(state.student, job);
            const applied = state.applications.some((a) => a.jobId === id);
            return (
              <div key={id} className="rounded-lg bg-white p-3.5 shadow-subtle">
                <div className="flex items-start gap-3">
                  <CompanyLogo initial={company.initial} color={company.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-bold text-ink-900">
                      {company.name}
                    </div>
                    <div className="truncate text-[12.5px] text-ink-500">{job.title}</div>
                    <div className="mt-1.5">
                      <FitPill score={fit.score} />
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'toggleSave', jobId: id })}
                    className="press text-ink-300"
                    aria-label="Remove from saved"
                  >
                    <IconClose size={17} />
                  </button>
                </div>
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      dispatch({ type: 'patch', patch: { detailJobId: id } });
                      dispatch({ type: 'nav', screen: 'detail' });
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={applied}
                    onClick={() => dispatch({ type: 'openNote', jobId: id })}
                  >
                    {applied ? 'Applied' : 'Apply'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Profile ------------------------------- */

export function Profile() {
  const { state, dispatch } = useStore();
  const [addingProject, setAddingProject] = useState(false);
  const s = state.student;
  const editing = state.profileEditing;
  const set = (patch: Partial<typeof s>) => dispatch({ type: 'updateStudent', patch });

  // Every item counts, so the number can only read 100% when nothing is left to add.
  const checklist: [boolean, string][] = [
    [Boolean(s.name), 'Add your name'],
    [Boolean(s.university), 'Add your university'],
    [Boolean(s.degree), 'Add your degree'],
    [Boolean(s.gradYear), 'Add your graduation year'],
    [s.skills.length >= 3, 'Add at least 3 skills'],
    [s.projects.length > 0, 'Add a project — it is the strongest signal you can send'],
    [s.experience.length > 0, 'Add any work or internship experience'],
    [Boolean(s.resume), 'Upload your resume'],
    [Boolean(s.links.github), 'Add a GitHub link — students with one get selected 2× more often'],
    [Boolean(s.links.portfolio), 'Add a portfolio link'],
    [Boolean(s.links.linkedin), 'Add your LinkedIn — it helps companies verify who you are'],
  ];
  const strength = Math.round((checklist.filter(([ok]) => ok).length / checklist.length) * 100);
  const nextSuggestion = checklist.find(([ok]) => !ok)?.[1];

  const appliedIds = state.applications.map((a) => a.jobId);
  const gaps = learningList(s, appliedIds, allJobs).slice(0, 3);

  return (
    <div className="flex h-full flex-col">
      <AddProjectSheet open={addingProject} onClose={() => setAddingProject(false)} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        <div className="relative h-[104px]" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C6CF5)' }}>
          <button
            onClick={() => dispatch({ type: 'patch', patch: { profileEditing: !editing } })}
            className="press absolute right-5 top-[60px] flex h-9 items-center gap-1.5 rounded-full bg-white/20 px-3.5 text-[12.5px] font-semibold text-white backdrop-blur"
          >
            {editing ? 'Done' : <><IconEdit size={14} /> Edit</>}
          </button>
        </div>

        {/* relative + z-10: the cover above is positioned, so an unpositioned sibling
            paints underneath it and the avatar disappears behind the gradient. */}
        <div className="relative z-10 -mt-9 px-5">
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-100 text-[26px] font-bold text-primary-500 ring-4 ring-canvas">
            {s.initial}
          </span>
          {editing ? (
            <div className="mt-3 flex flex-col gap-3">
              <Field label="Full name" value={s.name} onChange={(v) => set({ name: v })} />
              <Field label="Degree" value={s.degree} onChange={(v) => set({ degree: v })} />
              <Field
                label="University"
                value={s.university}
                onChange={(v) => set({ university: v })}
              />
              <Field
                label="Graduation year"
                value={s.gradYear}
                onChange={(v) => set({ gradYear: v })}
              />
            </div>
          ) : (
            <>
              <h1 className="mt-2.5 text-[21px] font-bold tracking-tight text-ink-900">{s.name}</h1>
              <p className="text-[13px] text-ink-500">{s.degree}</p>
              <p className="text-[12.5px] text-ink-300">
                {s.university} · Graduating {s.gradYear}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 px-5">
          <div className="rounded-lg bg-white p-4 shadow-subtle">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-900">Profile strength</span>
              <span className="text-[15px] font-bold text-primary-500">{strength}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${strength}%` }} />
            </div>
            {nextSuggestion && (
              <p className="mt-2.5 text-[12.5px] leading-[1.45] text-ink-500">{nextSuggestion}.</p>
            )}
          </div>
        </div>

        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {s.skills.map((sk) => {
              const backed = s.projects.some((p) =>
                p.tech.some((t) => t.toLowerCase() === sk.name.toLowerCase()),
              );
              return (
                <span
                  key={sk.name}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-canvas px-2 py-1 text-[11.5px] font-semibold text-ink-700"
                >
                  {backed && <span className="h-1.5 w-1.5 rounded-full bg-fit-500" />}
                  {sk.name}
                  {editing && (
                    <button
                      onClick={() => dispatch({ type: 'toggleSkill', skill: sk.name })}
                      className="text-ink-300"
                    >
                      ✕
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <p className="mt-2.5 text-[11.5px] text-ink-300">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-fit-500 align-middle" />
            Backed by a project
          </p>
        </Section>

        <Section title="Projects">
          <div className="space-y-3">
            {s.projects.map((p) => (
              <div key={p.id} className="rounded-md border border-line p-3">
                <div className="text-[14px] font-bold text-ink-900">{p.name}</div>
                <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-500">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <Tag key={t} kind="primary">
                      {t}
                    </Tag>
                  ))}
                </div>
                {(p.github || p.demo) && (
                  <div className="mt-2 text-[12px] font-medium text-primary-500">
                    {p.github ?? p.demo}
                  </div>
                )}
              </div>
            ))}
            {editing && (
              <button
                onClick={() => setAddingProject(true)}
                className="press flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-line py-3 text-[13px] font-semibold text-ink-500"
              >
                + Add project
              </button>
            )}
          </div>
        </Section>

        <Section title="Experience">
          {s.experience.map((e) => (
            <div key={e.id}>
              <div className="text-[14px] font-bold text-ink-900">{e.role}</div>
              <div className="text-[12.5px] text-ink-500">
                {e.company} · {e.mode}
              </div>
              <div className="mt-0.5 text-[12px] text-ink-300">{e.period}</div>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-ink-500">{e.summary}</p>
            </div>
          ))}
        </Section>

        {gaps.length > 0 && (
          <Section title="Skill gaps">
            <button
              onClick={() => dispatch({ type: 'nav', screen: 'learning' })}
              className="press flex w-full items-center gap-3 text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gap-100 text-gap-600">
                <IconTrend size={17} />
              </span>
              <span className="flex-1">
                <span className="block text-[13.5px] font-semibold text-ink-900">
                  {gaps.length} skills worth learning next
                </span>
                <span className="block text-[12px] text-ink-500">
                  {gaps.map((g) => g.skill).join(', ')}
                </span>
              </span>
              <IconChevron size={17} className="text-ink-300" />
            </button>
          </Section>
        )}

        <Section title="Resume">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-500">
              <IconFile size={17} />
            </span>
            <div className="flex-1">
              {s.resume ? (
                <>
                  <div className="text-[13.5px] font-semibold text-ink-900">{s.resume.filename}</div>
                  <div className="text-[12px] text-ink-300">
                    {s.resume.updated} · {s.resume.size}
                  </div>
                </>
              ) : (
                <div className="text-[13.5px] text-ink-300">No resume on file yet</div>
              )}
            </div>
            {editing && (
              <button
                onClick={() => dispatch({ type: 'patch', patch: { toast: 'Resume upload arrives with the backend' } })}
                className="press text-[12.5px] font-semibold text-primary-500"
              >
                {s.resume ? 'Replace' : 'Add'}
              </button>
            )}
          </div>
        </Section>

        <Section title="Links">
          {editing ? (
            <div className="flex flex-col gap-3">
              {(['github', 'portfolio', 'linkedin'] as const).map((k) => (
                <Field
                  key={k}
                  label={k === 'github' ? 'GitHub' : k === 'portfolio' ? 'Portfolio' : 'LinkedIn'}
                  value={s.links[k] ?? ''}
                  onChange={(v) => set({ links: { ...s.links, [k]: v || undefined } })}
                  placeholder={k === 'linkedin' ? 'linkedin.com/in/you' : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(['github', 'portfolio', 'linkedin'] as const).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-[12.5px] capitalize text-ink-500">{k}</span>
                  {s.links[k] ? (
                    <span className="text-[12.5px] font-medium text-primary-500">{s.links[k]}</span>
                  ) : (
                    <span className="text-[12.5px] text-ink-300">Not added</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 px-5">
      <SectionLabel>{title}</SectionLabel>
      <div className="rounded-lg bg-white p-4 shadow-subtle">{children}</div>
    </section>
  );
}
