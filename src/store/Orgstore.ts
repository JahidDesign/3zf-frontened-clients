import { create } from 'zustand';
import { OrgMembership, DonationProgram } from '@/types/organisation';

interface OrgStore {
  // Membership
  membership: OrgMembership | null;
  membershipLoading: boolean;
  setMembership: (m: OrgMembership | null) => void;
  setMembershipLoading: (v: boolean) => void;

  // Programs
  programs: DonationProgram[];
  activePrograms: DonationProgram[];
  pendingPrograms: DonationProgram[];
  completedPrograms: DonationProgram[];
  programsLoading: boolean;
  setPrograms: (p: DonationProgram[]) => void;
  setProgramsLoading: (v: boolean) => void;
  updateProgramInList: (id: string, patch: Partial<DonationProgram>) => void;

  // UI
  showRegistrationModal: boolean;
  setShowRegistrationModal: (v: boolean) => void;
}

const useOrgStore = create<OrgStore>((set, get) => ({
  membership: null,
  membershipLoading: true,
  setMembership: (membership) => set({ membership }),
  setMembershipLoading: (membershipLoading) => set({ membershipLoading }),

  programs: [],
  activePrograms: [],
  pendingPrograms: [],
  completedPrograms: [],
  programsLoading: true,
  setPrograms: (programs) =>
    set({
      programs,
      activePrograms:    programs.filter((p) => p.status === 'active'),
      pendingPrograms:   programs.filter((p) => ['pending_review', 'pending_vote'].includes(p.status)),
      completedPrograms: programs.filter((p) => p.status === 'completed'),
    }),
  setProgramsLoading: (programsLoading) => set({ programsLoading }),
  updateProgramInList: (id, patch) => {
    const programs = get().programs.map((p) => (p._id === id ? { ...p, ...patch } : p));
    get().setPrograms(programs);
  },

  showRegistrationModal: false,
  setShowRegistrationModal: (showRegistrationModal) => set({ showRegistrationModal }),
}));

export default useOrgStore;