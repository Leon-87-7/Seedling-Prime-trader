'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

/**
 * Renders an Avatar root using the Radix Avatar primitive with base styling and optional class overrides.
 *
 * @param className - Additional CSS classes to merge with the component's base styles.
 * @returns The configured Avatar root element ready to contain image or fallback content.
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the avatar image slot used inside Avatar, applying base and custom classes.
 *
 * @returns The Radix Avatar Image element configured as the avatar image slot.
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

/**
 * Render a styled fallback element for Avatar when the image cannot be displayed.
 *
 * @returns A Radix Avatar Fallback element with default layout and background classes, merged with `className` and any forwarded props.
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };