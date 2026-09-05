import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { getJob } from '../data/jobs';
import { getCompany } from '../data/companies';
import { suggestedReplies } from '../lib/note';
import { AppHeader } from '../components/AppHeader';
import { HomeIndicator, StatusBar } from '../components/PhoneFrame';
import { Button, CompanyLogo, EmptyState, FitPill } from '../components/ui';
import { IconBack, IconLock, IconSearch, IconSend } from '../components/Icons';

/* -------------------------------- Inbox -------------------------------- */

export function Inbox() {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState('');

  const visible = state.conversations.filter((c) => {
    if (!query.trim()) return true;
    const job = getJob(c.jobId);
    const haystack = `${getCompany(job.companyId).name} ${job.title} ${c.messages
      .map((m) => m.text)
      .join(' ')}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  if (!state.inboxUnlocked || state.conversations.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <AppHeader />
        <div className="px-5 pb-2">
          <h1 className="text-[21px] font-bold tracking-tight text-ink-900">Inbox</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-9 text-center">
          <div className="mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-3xl bg-white text-ink-300 shadow-subtle">
            <IconLock size={28} />
          </div>
          <h2 className="text-[18px] font-bold leading-snug text-ink-900">
            Your inbox unlocks when a company selects you
          </h2>
          <p className="mt-2.5 text-[13.5px] leading-[1.55] text-ink-500">
            Companies review everyone who applies. When one picks you, they send the first message
            here.
          </p>

          <div className="mt-6 w-full rounded-lg bg-white p-4 shadow-subtle">
            <div className="text-[24px] font-bold text-primary-500">
              {state.applications.filter((a) => a.status !== 'rejected').length}
            </div>
            <div className="text-[12.5px] text-ink-500">active applications in review</div>
          </div>

          <Button
            variant="secondary"
            className="mt-5"
            onClick={() => dispatch({ type: 'tab', tab: 'applications' })}
          >
            View applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <AppHeader />
      <div className="px-5 pb-3">
        <h1 className="text-[21px] font-bold tracking-tight text-ink-900">Inbox</h1>
      </div>
      <div className="px-5 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
            <IconSearch size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="h-10 w-full rounded-md border border-line bg-white pl-9 pr-3 text-[13.5px] placeholder:text-ink-300"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        {visible.length === 0 && (
          <p className="mt-8 text-center text-[13px] text-ink-300">
            No conversations match “{query}”.
          </p>
        )}
        {visible.map((c) => {
          const job = getJob(c.jobId);
          const company = getCompany(job.companyId);
          const last = c.messages[c.messages.length - 1];
          return (
            <button
              key={c.jobId}
              onClick={() => {
                dispatch({ type: 'patch', patch: { chatJobId: c.jobId } });
                dispatch({ type: 'readConversation', jobId: c.jobId });
                dispatch({ type: 'nav', screen: 'chat' });
              }}
              className="press mb-2.5 flex w-full items-start gap-3 rounded-lg bg-white p-3.5 text-left shadow-subtle"
            >
              <div className="relative">
                <CompanyLogo initial={company.initial} color={company.color} size={44} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-fit-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[14.5px] font-bold text-ink-900">
                    {company.name}
                  </span>
                  <span className="shrink-0 text-[11.5px] text-ink-300">{c.lastLabel}</span>
                </div>
                <div className="truncate text-[12px] text-ink-500">{job.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="truncate text-[12.5px] text-ink-500">{last?.text}</span>
                  {c.unread > 0 && (
                    <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary-500 px-1 text-[10.5px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------------- Chat --------------------------------- */

export function Chat() {
  const { state, dispatch } = useStore();
  const jobId = state.chatJobId!;
  const conversation = state.conversations.find((c) => c.jobId === jobId);
  const job = getJob(jobId);
  const company = getCompany(job.companyId);
  const application = state.applications.find((a) => a.jobId === jobId);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  const send = (text: string) => {
    dispatch({ type: 'send', jobId, text });
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col bg-canvas">
      <StatusBar />
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-2.5">
        <button onClick={() => dispatch({ type: 'back' })} className="press -ml-1 text-ink-700">
          <IconBack size={21} />
        </button>
        <CompanyLogo initial={company.initial} color={company.color} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-bold text-ink-900">{company.name}</div>
          <div className="truncate text-[11.5px] text-ink-500">{job.title}</div>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar px-4 py-4">
        {/* system card */}
        <button
          onClick={() => {
            dispatch({ type: 'patch', patch: { detailJobId: jobId } });
            dispatch({ type: 'nav', screen: 'detail' });
          }}
          className="press mx-auto block w-full rounded-lg border border-fit-500/25 bg-fit-100/60 p-3 text-center"
        >
          <div className="text-[12.5px] font-bold text-fit-600">
            {company.name} selected you for {job.title}
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <FitPill score={application?.fitSnapshot ?? 0} />
            <span className="text-[11.5px] font-semibold text-ink-500">View job →</span>
          </div>
        </button>

        {conversation?.messages.map((m, i) => (
          <div key={m.id}>
            {m.dayLabel && i === 0 && (
              <div className="my-3 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-300">
                {m.dayLabel}
              </div>
            )}
            <div className={`flex flex-col ${m.fromCompany ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[78%] px-3.5 py-2.5 text-[13.5px] leading-[1.45] ${
                  m.fromCompany
                    ? 'rounded-[16px] rounded-bl-[5px] bg-white text-ink-900 shadow-subtle'
                    : 'rounded-[16px] rounded-br-[5px] bg-primary-500 text-white'
                }`}
              >
                {m.text}
              </div>
              <span className="mt-1 text-[10.5px] text-ink-300">{m.time}</span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* suggested replies */}
      <div className="shrink-0 overflow-x-auto no-scrollbar px-4 pb-2">
        <div className="flex gap-2">
          {suggestedReplies.map((r) => (
            <button
              key={r}
              onClick={() => send(r)}
              className="press shrink-0 rounded-full border border-primary-300 bg-white px-3 py-1.5 text-[12px] font-medium text-primary-500"
            >
              ✦ {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-line bg-white px-4 py-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(draft)}
          placeholder="Message…"
          className="h-10 flex-1 rounded-full border border-line bg-canvas px-4 text-[14px] placeholder:text-ink-300"
        />
        <button
          onClick={() => send(draft)}
          disabled={!draft.trim()}
          className="press flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-40"
          aria-label="Send"
        >
          <IconSend size={18} />
        </button>
      </div>
      <HomeIndicator />
    </div>
  );
}
