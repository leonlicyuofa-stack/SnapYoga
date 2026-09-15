"use client";

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type GlossyVariant = 'primary' | 'ghost' | 'coral';

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlossyVariant;
  /** Icon rendered in the soft circle on the left. */
  icon?: React.ReactNode;
  /** Shows a spinner in the icon circle and disables the button. */
  loading?: boolean;
  fullWidth?: boolean;
}

// Glossy status-pill styling: a tinted gradient body + a soft glow, with the icon
// in a translucent circle. Gold (dark) / amethyst (light) for primary actions, a
// muted "ghost" for secondary, coral for destructive.
function styleFor(variant: GlossyVariant, isDark: boolean): { button: React.CSSProperties; icon: React.CSSProperties } {
  if (variant === 'coral') {
    return isDark
      ? {
          button: { background: 'linear-gradient(160deg, rgba(232,131,106,0.26) 0%, rgba(232,131,106,0.07) 55%, rgba(24,12,10,0.55) 100%)', border: '1px solid rgba(232,131,106,0.42)', boxShadow: '0 0 24px rgba(232,131,106,0.20), inset 0 1px 0 rgba(255,220,210,0.14)', color: 'rgba(255,226,218,0.96)' },
          icon: { background: 'rgba(232,131,106,0.3)', border: '1px solid rgba(232,131,106,0.55)', color: 'rgba(255,230,222,0.96)' },
        }
      : {
          button: { background: 'linear-gradient(160deg, rgba(168,60,40,0.12) 0%, rgba(255,255,255,0.3) 100%)', border: '1px solid rgba(168,60,40,0.4)', boxShadow: '0 6px 18px rgba(168,60,40,0.14), inset 0 1px 0 rgba(255,255,255,0.5)', color: '#A83C28' },
          icon: { background: 'rgba(168,60,40,0.14)', border: '1px solid rgba(168,60,40,0.45)', color: '#A83C28' },
        };
  }
  if (variant === 'ghost') {
    return isDark
      ? {
          button: { background: 'linear-gradient(160deg, rgba(193,154,107,0.12) 0%, rgba(20,17,28,0.4) 100%)', border: '1px solid rgba(193,154,107,0.22)', boxShadow: 'inset 0 1px 0 rgba(255,240,215,0.08)', color: 'rgba(255,240,215,0.8)' },
          icon: { background: 'rgba(193,154,107,0.14)', border: '1px solid rgba(193,154,107,0.3)', color: 'rgba(255,240,215,0.8)' },
        }
      : {
          button: { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(50,14,59,0.2)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)', color: 'rgba(50,14,59,0.7)' },
          icon: { background: 'rgba(50,14,59,0.08)', border: '1px solid rgba(50,14,59,0.22)', color: 'rgba(50,14,59,0.7)' },
        };
  }
  // primary
  return isDark
    ? {
        button: { background: 'linear-gradient(160deg, rgba(214,178,130,0.28) 0%, rgba(193,154,107,0.08) 55%, rgba(16,20,26,0.55) 100%)', border: '1px solid rgba(193,154,107,0.4)', boxShadow: '0 0 24px rgba(193,154,107,0.22), inset 0 1px 0 rgba(255,240,215,0.16)', color: 'rgba(255,240,215,0.96)' },
        icon: { background: 'rgba(214,178,130,0.3)', border: '1px solid rgba(214,178,130,0.5)', color: 'rgba(255,240,215,0.96)' },
      }
    : {
        button: { background: 'linear-gradient(160deg, rgba(50,14,59,0.12) 0%, rgba(255,255,255,0.34) 100%)', border: '1px solid rgba(50,14,59,0.28)', boxShadow: '0 6px 18px rgba(50,14,59,0.16), inset 0 1px 0 rgba(255,255,255,0.6)', color: '#320E3B' },
        icon: { background: 'rgba(50,14,59,0.12)', border: '1px solid rgba(50,14,59,0.3)', color: '#320E3B' },
      };
}

// forwardRef so the button can stand in as a Radix `asChild` trigger.
export const GlossyButton = React.forwardRef<HTMLButtonElement, GlossyButtonProps>(function GlossyButton(
  { variant = 'primary', icon, loading = false, fullWidth = false, children, className, disabled, style, ...props },
  ref,
) {
  const { isDark } = useTheme();
  const s = styleFor(variant, isDark);
  const off = disabled || loading;
  return (
    <button
      {...props}
      ref={ref}
      disabled={off}
      className={cn('sy-glossy-btn', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 11,
        height: 48,
        padding: icon ? '0 22px 0 9px' : '0 24px',
        borderRadius: 999,
        fontSize: 15,
        fontWeight: 500,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        cursor: off ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        opacity: off ? 0.55 : 1,
        transition: 'transform .15s ease, box-shadow .2s ease, opacity .2s ease',
        ...s.button,
        ...style,
      }}
    >
      {icon && (
        <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...s.icon }}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
});
