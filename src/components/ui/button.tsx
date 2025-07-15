
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoadingWithBar?: boolean;
  loadingBarDirection?: 'ltr' | 'rtl';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoadingWithBar = false, loadingBarDirection = 'ltr', children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      if (isLoadingWithBar) {
        setProgress(0);
        timer = setTimeout(() => setProgress(95), 100);
      } else {
        setProgress(0);
      }

      return () => {
        clearTimeout(timer);
      };
    }, [isLoadingWithBar]);


    if (isLoadingWithBar) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden cursor-default")}
          ref={ref}
          disabled
          {...props}
        >
          <div className="absolute inset-0 bg-muted/30 rounded-md"></div>
          <div
            className={cn(
                "absolute inset-y-0 h-full bg-primary/70 transition-all duration-500 ease-out",
                loadingBarDirection === 'rtl' ? 'right-0' : 'left-0'
            )}
            style={{ width: `${progress}%` }}
          ></div>
          <span className="relative z-10 text-primary-foreground/90 text-sm flex items-center justify-center">
            Loading...
          </span>
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
