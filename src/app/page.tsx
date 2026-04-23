'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Zap, Shield, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components/UI';

export default function Home() {
  return (
    <div className="min-h-screen animated-bg">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">Agent Builder</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
              Dashboard
            </Link>
            <Button size="sm">
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-6xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Agent Generation</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Build AI Agents
              <br />
              <span className="gradient-text">In Minutes, Not Days</span>
            </h1>

            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
              Create customized AI agents tailored to your industry and use case.
              Deploy instantly with our integrated platform.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/wizard">
                <Button size="lg" icon={<Zap className="w-5 h-5" />}>
                  Start Building
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-24"
          >
            <Card hover glow="primary">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Instant Generation</h3>
              <p className="text-text-secondary text-sm">
                Generate fully functional agents in minutes with our AI-powered builder.
              </p>
            </Card>

            <Card hover glow="secondary">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Enterprise Security</h3>
              <p className="text-text-secondary text-sm">
                Your data stays secure with encrypted storage and isolated containers.
              </p>
            </Card>

            <Card hover>
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">One-Click Deploy</h3>
              <p className="text-text-secondary text-sm">
                Deploy to web, Slack, WhatsApp, or custom APIs with a single click.
              </p>
            </Card>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-text-muted text-sm">
          <p>© 2024 Agent Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}