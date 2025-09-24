import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Server } from "lucide-react";

/** 固定后端 API 地址 */
const API_BASE = "http://120.24.29.86";

export default function App() {
  const [healthy, setHealthy] = useState<null | boolean>(null);
  const [rtt, setRtt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ping = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch(`${API_BASE}/healthz`, { method: "GET" });
        const ok = res.ok;
        const dt = performance.now() - t0;
        if (!cancelled) {
          setHealthy(ok);
          setRtt(Math.round(dt));
        }
      } catch {
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
  }, []);

  return (
    <div className="min-h-dvh w-full bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* 动态渐变背景 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        initial={{ backgroundPosition: "0% 50%" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 10%, rgba(99,102,241,0.25), transparent), radial-gradient(1000px 500px at 90% 20%, rgba(16,185,129,0.2), transparent), radial-gradient(800px 400px at 50% 100%, rgba(236,72,153,0.18), transparent)",
          backgroundSize: "200% 200%",
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-dvh w-4/5 flex-col items-stretch justify-center gap-8 px-6">
        {/* 标题 + 口号 */}
        <div className="text-center mb-10">
          <h1 className="whitespace-nowrap text-[clamp(2.2rem,5vw,3.5rem)] font-extrabold bg-gradient-to-r from-indigo-400 via-emerald-300 to-pink-400 bg-clip-text text-transparent">
            Welcome to Gary's Corporation AI Agent
          </h1>
          <p className="mt-3 text-lg font-medium text-emerald-300">
            Empowering Intelligence · Unlocking Insights
          </p>
        </div>

        {/* 顶部：进入 Chat */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-slate-900/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <MessageCircle className="h-5 w-5" />
                Start Conversation
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button
                onClick={() => {
                  window.location.href = "http://120.24.29.86/chat";
                }}
                className="w-full py-5 text-base font-semibold"
              >
                Go to Chat
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* 底部：后端健康 */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="bg-slate-900/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-slate-200">
                <Server className="h-5 w-5" />
                Backend Health
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 text-slate-300">
              <div className="flex items-baseline gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-sm ${
                    healthy == null
                      ? "bg-slate-700 text-slate-300"
                      : healthy
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {healthy == null ? "…" : healthy ? "Healthy" : "Down"}
                </span>
                <span className="text-xs text-slate-400">
                  {rtt != null ? `${rtt} ms RTT` : "no response"}
                </span>
              </div>
              <div className="shrink-0">
                <Button variant="secondary" onClick={() => window.location.reload()} className="px-4">
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
