import { useStore } from '../store';
import { allJobs, getCompany, getJob } from '../data/catalog';
import { computeFit, learningList } from '../lib/fit';
import { HomeIndicator, StatusBar } from '../components/PhoneFrame';
import {
  Button,
  CompanyCover,
  CompanyLogo,
  FitBar,
  FitPill,
  FitRing,
  SectionLabel,
  StatusTag,
  Tag,
  VerifiedBadge,
  statusLabel,
} from '../components/ui';
import type { ApplicationStatus } from '../data/types';
import { IconBack, IconCheck, IconChevron, IconFile } from '../components/Icons';

/* --------------------------- Application detail --------------------------- */

const FLOW: ApplicationStatus[] = ['applied', 'reviewing', 'shortlisted', 'selected'];

export function ApplicationDetail() {
  const { state, dispatch } = useStore();
  const jobId = state.appDetailJobId!;
  const app = state.applications.find((a) => a.jobId === jobId)!;
  const job = getJob(jobId);
  const company = getCompany(job.companyId);
  const fit = computeFit(state.student, job);

  const reachedIndex = FLOW.indexOf(app.status);
  const rejected = app.status === 'rejected';

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <Header title="Application" onBack={() => dispatch({ type: 'back' })} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        <div className="rounded-lg bg-white p-4 shadow-subtle">
          <div className="flex items-start gap-3">
            <CompanyLogo initial={company.initial} color={company.color} size={44} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-ink-900">{company.name}</span>
                {company.verified && <VerifiedBadge />}
              </div>
              <div className="text-[13px] text-ink-500">{job.title}</div>
              <div className="mt-1 text-[12px] text-ink-300">
                {job.location} · {job.workMode} · {job.durationMonths} months
              </div>
            </div>
            <StatusTag status={app.status} />
          </div>
        </div>

        {app.note && (
          <section className="mt-5">
            <SectionLabel>Note you sent</SectionLabel>
            <div className="rounded-lg bg-white p-4 shadow-subtle">
              <p className="border-l-2 border-primary-300 pl-3 text-[13px] italic leading-[1.55] text-ink-700">
                {app.note}
              </p>
              {app.noteWasAiDrafted && (
                <div className="mt-2.5 text-[11.5px] text-ink-300">✦ AI-drafted, edited by you</div>
              )}
            </div>
          </section>
        )}

        {app.resumeAttached && (
          <section className="mt-5">
            <SectionLabel>Resume attached</SectionLabel>
            <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-subtle">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-500">
                <IconFile size={17} />
              </span>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-ink-900">{app.resumeAttached}</div>
                <div className="text-[12px] text-ink-300">Sent with your application</div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-5">
          <SectionLabel>Fit at time of application</SectionLabel>
          <div className="rounded-lg bg-white p-4 shadow-subtle">
            <div className="flex items-center gap-5">
              <FitRing score={app.fitSnapshot} size={76} label={fit.bandLabel} />
              <div className="flex-1 space-y-2.5">
                <FitBar label="Skills" value={fit.breakdown.skills} />
                <FitBar label="Experience" value={fit.breakdown.experience} />
                <FitBar label="Interests" value={fit.breakdown.interests} />
                <FitBar label="Preferences" value={fit.breakdown.preferences} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <SectionLabel>Status</SectionLabel>
          <div className="rounded-lg bg-white p-4 shadow-subtle">
            {rejected ? (
              <>
                {app.timeline.map((t) => (
                  <TimelineRow key={t.status} label={statusLabel(t.status)} date={t.date} detail={t.detail} done />
                ))}
                <Button
                  variant="secondary"
                  full
                  className="mt-3"
                  onClick={() => dispatch({ type: 'tab', tab: 'discover' })}
                >
                  See similar roles
                </Button>
              </>
            ) : (
              FLOW.map((step, i) => {
                const event = app.timeline.find((t) => t.status === step);
                return (
                  <TimelineRow
                    key={step}
                    label={statusLabel(step)}
                    date={event?.date}
                    detail={
                      event?.detail ??
                      (step === 'selected' && i > reachedIndex
                        ? 'Your inbox unlocks if they pick you.'
                        : undefined)
                    }
                    done={i <= reachedIndex}
                    last={i === FLOW.length - 1}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      {app.status === 'selected' && (
        <div className="border-t border-line bg-white px-5 py-3.5">
          <Button
            full
            size="lg"
            onClick={() => {
              dispatch({ type: 'patch', patch: { chatJobId: jobId } });
              dispatch({ type: 'readConversation', jobId });
              dispatch({ type: 'nav', screen: 'chat' });
            }}
          >
            Open chat
          </Button>
        </div>
      )}
      <HomeIndicator />
    </div>
  );
}

function TimelineRow({
  label,
  date,
  detail,
  done,
  last,
}: {
  label: string;
  date?: string;
  detail?: string;
  done?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full"
          style={{ background: done ? '#4F46E5' : '#E8E8EF', color: '#fff' }}
        >
          {done && <IconCheck size={11} strokeWidth={3.4} />}
        </span>
        {!last && <span className="w-px flex-1" style={{ background: done ? '#4F46E5' : '#E8E8EF' }} />}
      </div>
      <div className={`pb-4 ${last ? 'pb-0' : ''}`}>
        <div className="flex items-center gap-2">
          <span
            className="text-[13.5px] font-semibold"
            style={{ color: done ? '#0F1117' : '#9CA3AF' }}
          >
            {label}
          </span>
          {date && <span className="text-[11.5px] text-ink-300">{date}</span>}
        </div>
        {detail && <p className="mt-0.5 text-[12.5px] leading-[1.45] text-ink-500">{detail}</p>}
      </div>
    </div>
  );
}

/* ---------------------------- Company profile ---------------------------- */

export function CompanyProfile() {
  const { state, dispatch } = useStore();
  const company = getCompany(state.companyId!);
  const openRoles = allJobs().filter((j) => j.companyId === company.id);

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="absolute inset-x-0 top-0 z-20">
        <StatusBar dark />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-5">
        <CompanyCover company={company} className="h-[150px]">
          <button
            onClick={() => dispatch({ type: 'back' })}
            className="press absolute left-5 top-[58px] flex h-9 items-center gap-1.5 rounded-full bg-black/25 px-3 text-[12.5px] font-semibold text-white backdrop-blur"
          >
            <IconBack size={16} /> Back to job
          </button>
        </CompanyCover>

        <div className="-mt-8 px-5">
          <div className="rounded-xl bg-white p-1.5 shadow-card" style={{ width: 'fit-content' }}>
            <CompanyLogo initial={company.initial} color={company.color} size={56} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-[22px] font-bold tracking-tight text-ink-900">{company.name}</h1>
            {company.verified && <VerifiedBadge />}
          </div>
          <p className="mt-1 text-[13.5px] text-ink-500">{company.tagline}</p>
        </div>

        <Block title="About">
          <p className="text-[13.5px] leading-[1.6] text-ink-700">{company.about}</p>
        </Block>

        <Block title="Details">
          <dl className="grid grid-cols-2 gap-y-3.5">
            {[
              ['Industry', company.industry],
              ['Company size', company.size],
              ['Founded', company.founded],
              ['Location', company.location],
              ['Website', company.website],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">
                  {k}
                </dt>
                <dd className="mt-0.5 text-[13px] text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block title="Culture">
          <div className="flex flex-wrap gap-1.5">
            {company.culture.map((c) => (
              <Tag key={c} kind="neutral">
                {c}
              </Tag>
            ))}
          </div>
        </Block>

        <Block title="Tech stack">
          <div className="flex flex-wrap gap-1.5">
            {company.stack.map((c) => (
              <Tag key={c} kind="primary">
                {c}
              </Tag>
            ))}
          </div>
        </Block>

        {company.team.length > 0 && (
          <Block title="Meet the team">
            <div className="space-y-3">
              {company.team.map((t) => (
                <div key={t.name} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-[14px] font-bold text-ink-500">
                    {t.initial}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink-900">{t.name}</div>
                    <div className="text-[12px] text-ink-500">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Block>
        )}

        <Block title="Open roles">
          <div className="space-y-2.5">
            {openRoles.map((j) => {
              const fit = computeFit(state.student, j);
              return (
                <button
                  key={j.id}
                  onClick={() => {
                    // Detail sits directly beneath this screen in the stack, so swap the
                    // job and pop back to it rather than pushing a second detail screen.
                    dispatch({ type: 'patch', patch: { detailJobId: j.id } });
                    dispatch({ type: 'back' });
                  }}
                  className="press flex w-full items-center gap-3 rounded-md border border-line p-3 text-left"
                >
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-ink-900">{j.title}</div>
                    <div className="text-[12px] text-ink-500">
                      {j.workMode} · ₹{(j.stipend / 1000).toFixed(0)}k/mo
                    </div>
                  </div>
                  <FitPill score={fit.score} />
                </button>
              );
            })}
          </div>
        </Block>
      </div>
      <HomeIndicator />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 px-5">
      <SectionLabel>{title}</SectionLabel>
      <div className="rounded-lg bg-white p-4 shadow-subtle">{children}</div>
    </section>
  );
}

/* ----------------------------- Learning list ----------------------------- */

export function LearningList() {
  const { state, dispatch } = useStore();
  const appliedIds = state.applications.map((a) => a.jobId);
  const items = learningList(state.student, appliedIds, allJobs());

  const counts = {
    todo: items.filter((i) => (state.learn[i.skill] ?? 'todo') === 'todo').length,
    learning: items.filter((i) => state.learn[i.skill] === 'learning').length,
    done: items.filter((i) => state.learn[i.skill] === 'done').length,
  };

  const top = items[0];

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <Header title="Skill gaps" onBack={() => dispatch({ type: 'back' })} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        <p className="text-[13.5px] leading-[1.5] text-ink-500">
          Collected from your active applications, ranked by how many of them want each skill.
        </p>

        <div className="mt-4 flex gap-2">
          <Pill label={`${counts.todo} to start`} />
          <Pill label={`${counts.learning} in progress`} tone="primary" />
          <Pill label={`${counts.done} done`} tone="fit" />
        </div>

        <div className="mt-4 space-y-2.5">
          {items
            .filter((item) => state.learn[item.skill] !== 'skipped')
            .map((item) => {
            const status = state.learn[item.skill] ?? 'todo';
            return (
              <div key={item.skill} className="rounded-lg bg-white p-4 shadow-subtle">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-[14.5px] font-bold text-ink-900">{item.skill}</div>
                    <div className="mt-0.5 text-[12.5px] text-ink-500">
                      Wanted by {item.count} of your applications
                      {item.required > 0 && ` · required by ${item.required}`}
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-bold text-ink-300">
                    {item.count}/{item.total}
                  </span>
                </div>

                <p className="mt-2 text-[12.5px] leading-[1.45] text-ink-500">{item.hint}</p>

                <button
                  onClick={() => dispatch({ type: 'dismissGap', skill: item.skill })}
                  className="press mt-2 text-[12px] font-semibold text-ink-300"
                >
                  Not for me — skip this skill →
                </button>

                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  {(['todo', 'learning', 'done'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => dispatch({ type: 'setLearn', skill: item.skill, status: s })}
                      className={`press flex-1 rounded-md py-2 text-[12px] font-semibold transition-colors ${
                        status === s
                          ? s === 'done'
                            ? 'bg-fit-100 text-fit-600'
                            : 'bg-primary-100 text-primary-500'
                          : 'bg-canvas text-ink-300'
                      }`}
                    >
                      {s === 'todo' ? 'Not started' : s === 'learning' ? 'Learning' : 'Done'}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {top && (
          <div
            className="mt-5 rounded-lg p-4 text-white"
            style={{ background: 'linear-gradient(135deg,#6C5CE7,#A78BFA)' }}
          >
            <div className="text-[14.5px] font-bold">
              You're one skill away from stronger matches
            </div>
            <p className="mt-1.5 text-[12.5px] leading-[1.45] text-white/75">
              Learn {top.skill} and you close the biggest gap across your applications.
            </p>
          </div>
        )}
      </div>
      <HomeIndicator />
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone?: 'primary' | 'fit' }) {
  const cls =
    tone === 'fit'
      ? 'bg-fit-100 text-fit-600'
      : tone === 'primary'
        ? 'bg-primary-100 text-primary-500'
        : 'bg-white text-ink-500';
  return <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${cls}`}>{label}</span>;
}

/* ----------------------------- Notifications ----------------------------- */

const IconChevronRight = () => (
  <span className="mt-1 shrink-0 text-ink-300">
    <IconChevron size={16} />
  </span>
);

export function Notifications() {
  const { state, dispatch } = useStore();
  const groups = [...new Set(state.notifications.map((n) => n.group))];

  /** Every notification now leads somewhere — they used to be inert. */
  const openNotification = (n: (typeof state.notifications)[number]) => {
    const markRead = () =>
      dispatch({
        type: 'patch',
        patch: {
          notifications: state.notifications.map((x) =>
            x.id === n.id ? { ...x, unread: false } : x,
          ),
        },
      });
    markRead();

    if (n.kind === 'selected' || n.kind === 'message') {
      const conversation = state.conversations[0];
      if (conversation) {
        dispatch({ type: 'patch', patch: { chatJobId: conversation.jobId } });
        dispatch({ type: 'readConversation', jobId: conversation.jobId });
        dispatch({ type: 'nav', screen: 'chat' });
        return;
      }
    }
    if (n.kind === 'status') {
      const app =
        state.applications.find((a) => a.status === 'shortlisted') ?? state.applications[0];
      if (app) {
        dispatch({ type: 'patch', patch: { appDetailJobId: app.jobId } });
        dispatch({ type: 'nav', screen: 'appDetail' });
        return;
      }
    }
    if (n.kind === 'matches') {
      dispatch({ type: 'tab', tab: 'discover' });
      dispatch({ type: 'back' });
      return;
    }
    dispatch({ type: 'tab', tab: 'profile' });
    dispatch({ type: 'back' });
  };

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <Header title="Notifications" onBack={() => dispatch({ type: 'back' })} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
        {groups.map((g) => (
          <div key={g} className="mb-5">
            <SectionLabel>{g}</SectionLabel>
            <div className="space-y-2">
              {state.notifications
                .filter((n) => n.group === g)
                .map((n) => (
                  <button
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className="press block w-full rounded-lg p-3.5 text-left shadow-subtle"
                    style={{ background: n.unread ? '#F3F3FE' : '#fff' }}
                  >
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                      <div className="flex-1">
                        <div className="text-[13.5px] font-bold text-ink-900">{n.title}</div>
                        <p className="mt-1 text-[12.5px] leading-[1.45] text-ink-500">{n.body}</p>
                        <div className="mt-1.5 text-[11.5px] text-ink-300">{n.time}</div>
                      </div>
                      <IconChevronRight />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
      <HomeIndicator />
    </div>
  );
}

/* -------------------------------- shared -------------------------------- */

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-5 py-2.5">
      <button onClick={onBack} className="press -ml-1 text-ink-700" aria-label="Back">
        <IconBack size={22} />
      </button>
      <h1 className="text-[17px] font-bold text-ink-900">{title}</h1>
    </div>
  );
}
