import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  animation?: 'fade-in' | 'slide-up' | 'slide-right' | 'scale-in';
}

export function AnimatedContainer({
  children,
  delay = 0,
  className,
  animation = 'fade-in',
}: AnimatedContainerProps) {
  const animationClass = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'slide-right': 'animate-slide-in-right',
    'scale-in': 'animate-scale-in',
  }[animation];

  return (
    <div
      className={cn(animationClass, className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: ReactNode[];
  baseDelay?: number;
  staggerDelay?: number;
  className?: string;
  animation?: 'fade-in' | 'slide-up' | 'slide-right' | 'scale-in';
}

export function StaggeredList({
  children,
  baseDelay = 0,
  staggerDelay = 50,
  className,
  animation = 'slide-up',
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <AnimatedContainer
          key={index}
          delay={baseDelay + index * staggerDelay}
          animation={animation}
        >
          {child}
        </AnimatedContainer>
      ))}
    </div>
  );
}
