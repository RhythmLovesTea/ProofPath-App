import { create } from 'zustand';

interface AppState {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  beneficiaryName: string;
  beneficiaryPhone: string;
  setBeneficiaryInfo: (name: string, phone: string) => void;
  proofPathId: string;
  setProofPathId: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  beneficiaryName: '',
  beneficiaryPhone: '',
  setBeneficiaryInfo: (name, phone) => set({ beneficiaryName: name, beneficiaryPhone: phone }),
  proofPathId: '',
  setProofPathId: (id) => set({ proofPathId: id }),
}));
