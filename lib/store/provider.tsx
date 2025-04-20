"use client";

import { Provider, createStore } from 'jotai';
import { useRef } from 'react';
import type { PropsWithChildren } from 'react';

export function JotaiProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<ReturnType<typeof createStore>>();
  if (!storeRef.current) {
    storeRef.current = createStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
} 