"use client";

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { SnapYogaLogo } from '@/components/icons/snap-yoga-logo';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen font-serif text-white">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-8 space-y-8 text-center">
            <div className="mx-auto mb-4 inline-block">
              <SnapYogaLogo />
            </div>

            <XCircle className="h-16 w-16 mx-auto text-yellow-400" />
            <h1 className="text-2xl font-bold">Payment Cancelled</h1>
            <p className="text-white/70 text-sm">
              No worries — your payment was not charged. You can start your free trial whenever you&apos;re ready.
            </p>

            <Button
              onClick={() => router.replace('/onboarding/subscription')}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              Back to Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
