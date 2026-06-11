'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useRouter } from 'next/navigation';
import { Car, AlertCircle, Sparkles, ShieldCheck, Compass } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 'Failed to sign in with Google. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950 items-center justify-center p-6 relative overflow-hidden">
      {/* Premium grid mesh backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293712_1px,transparent_1px),linear-gradient(to_bottom,#1f293712_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Floating dynamic glow orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Glassmorphic card */}
      <div className="w-full max-w-md bg-gray-900/35 backdrop-blur-2xl border border-gray-800/80 p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in overflow-hidden">
        {/* Card accent top border */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 shadow-inner mb-4">
            <Car className="w-8 h-8 text-emerald-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            CityRide{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-xs text-gray-400 text-center max-w-[280px] leading-relaxed">
            Your premium autonomous intra-city ride companion in Đà Nẵng
          </p>
        </div>

        {/* General Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-scale-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="group relative w-full flex items-center justify-center gap-3.5 py-4 px-6 rounded-2xl bg-gray-950/60 hover:bg-gray-900 border border-gray-800 hover:border-emerald-500/50 text-gray-150 hover:text-white text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Premium feature taglines */}
        <div className="mt-10 pt-8 border-t border-gray-850/50 space-y-4">
          <div className="flex items-center gap-3.5 text-xs text-gray-400">
            <div className="w-8 h-8 rounded-lg bg-gray-950/50 flex items-center justify-center border border-gray-850">
              <Car className="w-4 h-4 text-emerald-400" />
            </div>
            <span>Inner-city ride booking & simulation</span>
          </div>
          <div className="flex items-center gap-3.5 text-xs text-gray-400">
            <div className="w-8 h-8 rounded-lg bg-gray-950/50 flex items-center justify-center border border-gray-850">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <span>Collaborative AI agent sidebar assistant</span>
          </div>
          <div className="flex items-center gap-3.5 text-xs text-gray-400">
            <div className="w-8 h-8 rounded-lg bg-gray-950/50 flex items-center justify-center border border-gray-850">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <span>Interactive generative UI estimation cards</span>
          </div>
        </div>
      </div>
    </div>
  );
}
