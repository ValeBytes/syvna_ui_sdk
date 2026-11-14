"use client";

// Movement for containers: something that eases in when it is scrolled to, or
// when the page opens. For public pages (landing pages, shops); app screens
// don't use it.

import { Children, useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "../cx";

export const revealEffects = ["up", "down", "left", "right", "fade", "scale", "blur"] as const;
export type RevealEffect = (typeof revealEffects)[number];

export interface RevealProps {
  /** What eases in: a section's heading, a card, a picture, a whole band. */
  children: React.ReactNode;
  /**
   * How it arrives. up: rises a little (the default, right for most things). down, left, right: from
   * that side (pictures beside text come from their own side). fade: only opacity (long text, tables).
   * scale: grows slightly (a product shot, a card). blur: sharpens (one hero picture at most).
   */
  effect?: RevealEffect;
  /**
   * view: when it's scrolled to (the default); what's already on screen when the page opens stays
   * still. load: as the page opens, for the first screen: the hero's words, then its picture.
   */
  when?: "view" | "load";
  /** Milliseconds to wait first: 0, 80, 160 down a row makes it arrive one after another. */
  delay?: number;
  /** Milliseconds it takes. 600 by default; 400 for small things, 800 for one big picture. */
  duration?: number;
  /** How far it travels, in pixels, for up, down, left and right. 16 by default. */
  distance?: number;
  /** Play every time it's scrolled to, not just the first. Off by default. */
  repeat?: boolean;
  /** The element it renders: "div" by default; "li" inside a list, "section" for a band. */
  as?: React.ElementType;
  className?: string;
  style?: React.CSSProperties;
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function from(effect: RevealEffect, distance: number): React.CSSProperties {
  switch (effect) {
    case "up":
      return { opacity: 0, transform: `translate3d(0, ${distance}px, 0)` };
    case "down":
      return { opacity: 0, transform: `translate3d(0, ${-distance}px, 0)` };
    case "left":
      return { opacity: 0, transform: `translate3d(${distance}px, 0, 0)` };
    case "right":
      return { opacity: 0, transform: `translate3d(${-distance}px, 0, 0)` };
    case "scale":
      return { opacity: 0, transform: "scale(0.96)" };
    case "blur":
      return { opacity: 0, filter: "blur(10px)" };
    default:
      return { opacity: 0 };
  }
}

/**
 * A container that eases in when it's scrolled to, or as the page opens.
 * Nothing is hidden without JavaScript or for people who ask for less motion,
 * and what is already on screen never jumps.
 */
export function Reveal({ children, effect = "up", when = "view", delay = 0, duration = 600, distance = 16, repeat = false, as: Tag = "div", className, style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // shown: as the server rendered it. waiting: hidden, below the screen. in: easing to its place.
  const [state, setState] = useState<"shown" | "waiting" | "in">("shown");

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (when !== "view" || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only what's below the screen waits: hiding something already in view would make it blink.
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setState("in");
            if (!repeat) io.disconnect();
          } else if (repeat && e.boundingClientRect.top > 0) {
            setState("waiting");
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [when, repeat]);

  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
  const hidden = from(effect, distance);
  let motion: React.CSSProperties = {};
  if (when === "load") {
    // A CSS animation, so it plays from the first paint with no JavaScript.
    motion = {
      animation: `sy-enter ${duration}ms ${ease} ${delay}ms both`,
      ["--sy-enter-transform" as string]: hidden.transform ?? "none",
      ["--sy-enter-filter" as string]: hidden.filter ?? "none",
    };
  } else if (state === "waiting") {
    motion = { ...hidden, willChange: "opacity, transform" };
  } else if (state === "in") {
    motion = { transition: `opacity ${duration}ms ${ease} ${delay}ms, transform ${duration}ms ${ease} ${delay}ms, filter ${duration}ms ${ease} ${delay}ms` };
  }
  return (
    <Tag ref={ref} className={cn(when === "load" && "motion-reduce:animate-none!", className)} style={{ ...style, ...motion }}>
      {children}
    </Tag>
  );
}

export interface StaggerProps {
  /** The things that arrive one after another: cards, features, logos, steps. */
  children: React.ReactNode;
  /** How each arrives; see Reveal. */
  effect?: RevealEffect;
  /** view (when scrolled to) or load (as the page opens); see Reveal. */
  when?: "view" | "load";
  /** Milliseconds between one and the next. 80 by default; keep the whole row under a second. */
  gap?: number;
  /** Milliseconds before the first. */
  delay?: number;
  /** Milliseconds each takes. */
  duration?: number;
  /** The container's element: "div" by default, "ul" for a list. */
  as?: React.ElementType;
  /** Each child's wrapper: "div" by default, "li" inside a "ul". */
  itemAs?: React.ElementType;
  /** The container's classes: the grid or row the children sit in. */
  className?: string;
  /** Classes for each child's wrapper, which is the grid's item: "h-full", "col-span-2". */
  itemClassName?: string;
}

/** A grid or row whose children ease in one after another. */
export function Stagger({ children, effect = "up", when = "view", gap = 80, delay = 0, duration = 600, as: Tag = "div", itemAs = "div", className, itemClassName }: StaggerProps) {
  return (
    <Tag className={className}>
      {Children.toArray(children).map((child, i) => (
        <Reveal key={i} as={itemAs} effect={effect} when={when} delay={delay + i * gap} duration={duration} className={itemClassName}>
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}
