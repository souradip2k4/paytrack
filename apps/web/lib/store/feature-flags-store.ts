
import { createStore } from 'zustand/vanilla'

export type FeatureFlags = Record<string, boolean>

export type FeatureFlagState = {
  flags: FeatureFlags
  setFlags: (flags: FeatureFlags) => void
}

export const createFeatureFlagStore = (initialFlags: FeatureFlags = {}) => {
  return createStore<FeatureFlagState>()((set) => ({
    flags: initialFlags,
    setFlags: (flags) => set({ flags }),
  }))
}
