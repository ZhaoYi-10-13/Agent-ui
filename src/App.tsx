import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Loader2, SendHorizonal, Server, ArrowLeft } from "lucide-react";

const DEFAULT_API = (typeof window !== "undefined" && (window as any).__RAG_BASE_URL__) || "http://localhost:8000";

export default function App() {
  const [view, setView] = useState<"home" | "chat">("home");
  const [apiBase, setApiBase] = useState<string>(DEFAULT_API);
  const [healthy, setHealthy] = useState<null | boolean>(null);
  const [rtt, setRtt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${apiBase}/healthz`, { method: "GET" });
        const ok = res.ok;
        const dt = performance.now() - t0;
        if (!cancelled) {
          setHealthy(ok);
          setRtt(Math.round(dt));
        }
      } catch (e) {
        if (!cancelled) {
          setHealthy(false);
          setRtt(null);
        }
      }
    };
    ping();
    const id = setInterval(ping, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [apiBase]);

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100">
      <AnimatePresence mode="wait">
        {view === "home" ? (
          <Landing key="home" apiBase={apiBase} healthy={healthy} rtt={rtt} onStart={() => setView("chat")} />
        ) : (
          <Chat key="chat" apiBase={apiBase} onBack={() => setView("home")} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Landing({ apiBase, healthy, rtt, onStart }: { apiBase: string; healthy: boolean | null; rtt: number | null; onStart: () => void; }) {
  return (
    <div className="relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          background: "radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,0.25), transparent), radial-gradient(1000px 500px at 90% 20%, rgba(16,185,129,0.2), transparent), radial-gradient(800px 400px at 50% 100%, rgba(236,72,153,0.18), transparent)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <main className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center gap-10 px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">New</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-indigo-300 via-emerald-200 to-pink-300 bg-clip-text text-transparent">
              Welcome to Gary Corporation AI Agent
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-slate-300/90">
            统一技术栈（React + Tailwind + framer-motion + shadcn/ui）。检索增强问答（RAG）助你高效获取知识与洞见。
          </p>
        </motion.div>

        {/* Two main cards */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-200"><MessageCircle className="h-5 w-5" /> 开始聊天</CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button onClick={onStart} className="w-full">
                进入 Chat
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-200"><Server className="h-5 w-5" /> 后端健康</CardTitle>
            </CardHeader>
            <CardContent className="flex items-baseline gap-2 text-slate-300">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm ${healthy==null?"bg-slate-700 text-slate-300":""} ${healthy?"bg-emerald-500/20 text-emerald-300":"bg-rose-500/20 text-rose-300"}`}>
                {healthy==null?"…": healthy?"Healthy":"Down"}
              </span>
              <span className="text-xs text-slate-400">{rtt!=null? `${rtt} ms RTT` : "no response"}</span>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

function Chat({ apiBase, onBack }: { apiBase: string; onBack: () => void }) {
  type Msg = { role: "user" | "assistant"; text: string; citations?: string[]; latency_ms?: number };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scRef.current?.scrollTo({ top: scRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const ask = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`${apiBase}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, top_k: 6 }),
      });
      const dt = Math.round(performance.now() - t0);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const text = data.text || JSON.stringify(data);
      const citations = data.citations || [];
      setMessages((m) => [...m, { role: "assistant", text, citations, latency_ms: dt }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", text: `❌ Error: ${e?.message || e}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4"/> 返回首页</Button>
        <h2 className="text-lg font-semibold text-slate-200">Gary Corporation AI Agent · Chat</h2>
      </div>

      <Card className="flex flex-1 flex-col bg-slate-900/70 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-slate-200"><MessageCircle className="h-5 w-5"/> 对话</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ScrollArea className="h-[60vh] pr-4" ref={scRef as any}>
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-slate-400">试着问："What is your standard project delivery process?"</div>
              )}
              {messages.map((m, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  className={`rounded-2xl p-3 ${m.role === "user" ? "bg-indigo-600/20 border border-indigo-400/30" : "bg-slate-800/80 border border-slate-700"}`}>
                  <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">{m.role}</div>
                  <div className="whitespace-pre-wrap text-slate-100">{m.text}</div>
                  {m.citations?.length ? (
                    <div className="mt-2 text-xs text-slate-400">📚 Sources: {m.citations.join(", ")}</div>
                  ) : null}
                  {typeof m.latency_ms === "number" && (
                    <div className="mt-1 text-[10px] text-slate-500">⏱ {m.latency_ms} ms</div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin"/> 思考中…</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题…"
              className="flex-1 rounded bg-slate-950/70 px-3 py-2 text-slate-100"
              onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
            />
            <Button onClick={ask} disabled={loading || !input.trim()} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <SendHorizonal className="h-4 w-4"/>}
              发送
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>Backend: <span className="text-slate-300">{apiBase}</span></div>
        <div className="hidden sm:block">Tech: React · Tailwind · framer-motion · shadcn/ui</div>
      </div>
    </div>
  );
}
