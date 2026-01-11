"use client";

import { createContext, useContext, useRef } from "react";
import { useStore } from 'zustand'
import { type FeatureFlagState, createFeatureFlagStore } from '../lib/store/feature-flags-store'

export type FeatureFlagStore = ReturnType<typeof createFeatureFlagStore>

const FeatureFlagStoreContext = createContext<FeatureFlagStore | null>(null)

type FeatureFlags = Record<string, boolean>;

type Props = {
  children: React.ReactNode;
  initialFlags: FeatureFlags;
}

export const FeatureFlagProvider = ({
  children,
  initialFlags,
}: Props) => {
  const storeRef = useRef<FeatureFlagStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createFeatureFlagStore(initialFlags)
  }

  return (
    <FeatureFlagStoreContext.Provider value={storeRef.current}>
      {children}
    </FeatureFlagStoreContext.Provider>
  )
}

export const useFeatureFlag = (key: string) => {
  const store = useContext(FeatureFlagStoreContext)
  if (!store) {
    throw new Error('useFeatureFlag must be used within FeatureFlagProvider')
  }
  
  const isEnabled = useStore(store, (state) => !!state.flags[key])
  return { isEnabled }
};
