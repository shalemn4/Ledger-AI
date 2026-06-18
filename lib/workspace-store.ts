import { create } from "zustand";

export type PanelTab = "output" | "sources";
export type WorkspaceView = "projects" | "documents" | "timeline" | "all-runs" | "needs-review";

export type DocumentItem = {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "Indexed" | "Processing" | "Failed";
  chunks: number;
  content: string;
};

export type UserSession = {
  email: string;
  name: string;
};

export type WorkspaceState = {
  activeStep: number;
  playing: boolean;
  tab: PanelTab;
  rightPanelOpen: boolean;
  currentView: WorkspaceView;
  activeProjectId: string;
  selectedDocumentId: string | null;
  searchQuery: string;
  searchModalOpen: boolean;
  documents: DocumentItem[];
  
  // Auth Session State
  user: UserSession | null;
  otpSentToEmail: string | null;
  tempSignUpData: { name: string; email: string } | null;

  setStep: (step: number) => void;
  togglePlaying: () => void;
  setPlaying: (playing: boolean) => void;
  setTab: (tab: PanelTab) => void;
  toggleRightPanel: () => void;
  setView: (view: WorkspaceView) => void;
  setActiveProjectId: (id: string) => void;
  setSelectedDocumentId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchModalOpen: (open: boolean) => void;
  addDocument: (doc: DocumentItem) => void;
  deleteDocument: (id: string) => void;

  // Auth Session Actions
  signIn: (email: string, password: string) => boolean;
  signUp: (name: string, email: string) => void;
  verifyOtp: (code: string) => boolean;
  signOut: () => void;
};

const defaultDocs: DocumentItem[] = [
  {
    id: "doc-1",
    name: "EU AI Act — Controls.pdf",
    size: "1.4 MB",
    uploadedAt: "2026-06-12",
    status: "Indexed",
    chunks: 142,
    content: "The EU Artificial Intelligence Act sets out rules for risk management and transparency in AI systems. High-risk systems require rigorous data governance, detailed logging, and human oversight. Article 4.2 specifically highlights controls around security, risk mitigation, and systemic reviews to ensure transparency and accountability."
  },
  {
    id: "doc-2",
    name: "SOC 2 Control Matrix.pdf",
    size: "450 KB",
    uploadedAt: "2026-06-14",
    status: "Indexed",
    chunks: 68,
    content: "SOC 2 CC6.1 specifies logical access security controls. Organizations must manage credentials, implement quarterly access reviews, and establish vendor compliance criteria. Auditable evidence must be recorded for authorization changes, system logging, and vulnerability management cycles."
  },
  {
    id: "doc-3",
    name: "Data Retention Policy.pdf",
    size: "320 KB",
    uploadedAt: "2026-06-15",
    status: "Indexed",
    chunks: 24,
    content: "Under Section 12 of the Data Retention Policy, user prompt logs, retriever tokens, and model outputs must be stored securely for at least 7 years. These records are subject to compliance reviews. Access to raw logging data must be restricted to authorized auditors."
  },
  {
    id: "doc-4",
    name: "Vendor Security Standard.pdf",
    size: "890 KB",
    uploadedAt: "2026-06-16",
    status: "Indexed",
    chunks: 89,
    content: "Section 7 of the Vendor Security Standard defines the review cadence for external subprocessors. Third-party risk assessments must be updated annually or upon material changes to data flows. The builder system must capture and verify data sharing citations automatically before synthesis."
  }
];

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeStep: 7, // Default to complete state
  playing: false,
  tab: "output",
  rightPanelOpen: true,
  currentView: "projects",
  activeProjectId: "compliance-roadmap",
  selectedDocumentId: null,
  searchQuery: "",
  searchModalOpen: false,
  documents: defaultDocs,

  // Auth Session initial state
  user: null, // Start logged out
  otpSentToEmail: null,
  tempSignUpData: null,

  setStep: (activeStep) => set({ activeStep, playing: false }),
  togglePlaying: () => set((state) => ({ playing: !state.playing })),
  setPlaying: (playing) => set({ playing }),
  setTab: (tab) => set({ tab }),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setView: (currentView) => set({ currentView }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId, activeStep: 7, playing: false, tab: "output" }),
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchModalOpen: (searchModalOpen) => set({ searchModalOpen }),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  deleteDocument: (id) => set((state) => ({ 
    documents: state.documents.filter(doc => doc.id !== id),
    selectedDocumentId: state.selectedDocumentId === id ? null : state.selectedDocumentId
  })),

  // Auth Actions
  signIn: (email, password) => {
    // Standard test credentials
    if (email === "asha@acme.com" && password === "password123") {
      set({ user: { email: "asha@acme.com", name: "Asha Singh" } });
      return true;
    }
    // Allow standard admin credentials
    if (email === "admin@ledger.ai" && password === "admin123") {
      set({ user: { email: "admin@ledger.ai", name: "Admin Team" } });
      return true;
    }
    return false;
  },

  signUp: (name, email) => {
    set({ 
      otpSentToEmail: email,
      tempSignUpData: { name, email }
    });
  },

  verifyOtp: (code) => {
    // The user specified OTP must be exactly "864114"
    if (code === "864114") {
      const state = useWorkspaceStore.getState();
      if (state.tempSignUpData) {
        set({ 
          user: { 
            email: state.tempSignUpData.email, 
            name: state.tempSignUpData.name 
          },
          otpSentToEmail: null,
          tempSignUpData: null
        });
        return true;
      }
    }
    return false;
  },

  signOut: () => {
    set({ user: null, otpSentToEmail: null, tempSignUpData: null });
  }
}));
