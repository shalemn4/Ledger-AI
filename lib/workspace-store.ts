import { create } from "zustand";
import { ProjectConfig } from "./project-data";

export type PanelTab = "output" | "sources" | "evals";
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
  projects: Record<string, ProjectConfig>;
  isLoading: boolean;
  
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
  
  // API Sync Actions
  fetchProjects: () => Promise<void>;
  fetchDocuments: () => Promise<void>;
  uploadDocumentFile: (file: File) => Promise<DocumentItem>;
  deleteDocument: (id: string) => Promise<void>;
  createRun: (prompt: string) => Promise<void>;

  // Auth Session Actions
  signIn: (email: string, password: string) => boolean;
  signUp: (name: string, email: string) => void;
  verifyOtp: (code: string) => boolean;
  signOut: () => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeStep: 7, // Default to complete state
  playing: false,
  tab: "output",
  rightPanelOpen: true,
  currentView: "projects",
  activeProjectId: "compliance-roadmap",
  selectedDocumentId: null,
  searchQuery: "",
  searchModalOpen: false,
  documents: [],
  projects: {},
  isLoading: false,

  // Auth Session initial state
  user: null, // Start logged out
  otpSentToEmail: null,
  tempSignUpData: null,

  setStep: (activeStep) => set({ activeStep, playing: false }),
  togglePlaying: () => set((state) => {
    if (state.playing) {
      return { playing: false };
    } else {
      const nextStep = state.activeStep >= 7 ? 0 : state.activeStep;
      return { activeStep: nextStep, playing: true };
    }
  }),
  setPlaying: (playing) => set({ playing }),
  setTab: (tab) => set({ tab }),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setView: (currentView) => set({ currentView }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId, activeStep: 7, playing: false, tab: "output" }),
  setSelectedDocumentId: (selectedDocumentId) => set({ selectedDocumentId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchModalOpen: (searchModalOpen) => set({ searchModalOpen }),

  fetchProjects: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        set({ projects: data });
      }
    } catch (err) {
      console.error("Failed to fetch projects from backend:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDocuments: async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        set({ documents: data });
      }
    } catch (err) {
      console.error("Failed to fetch documents from backend:", err);
    }
  },

  uploadDocumentFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "File upload failed");
    }

    const doc = await res.json();
    await get().fetchDocuments();
    return doc;
  },

  deleteDocument: async (id: string) => {
    const res = await fetch(`/api/documents?id=${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      await get().fetchDocuments();
      if (get().selectedDocumentId === id) {
        set({ selectedDocumentId: null });
      }
    }
  },

  createRun: async (prompt: string) => {
    try {
      set({ isLoading: true });
      const activeProjId = get().activeProjectId;
      
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProjId, prompt })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Run execution failed");
      }

      const updatedProject = await res.json();
      set((state) => ({
        projects: { ...state.projects, [activeProjId]: updatedProject },
        activeStep: 0, // Reset step to 0 to watch replay
        playing: true, // Auto-play the replay!
        tab: "output"  // Focus on AI Output view
      }));
    } catch (err: any) {
      alert(err.message || "Failed to execute prompt on active documents.");
    } finally {
      set({ isLoading: false });
    }
  },

  // Auth Actions
  signIn: (email, password) => {
    if (email === "asha@acme.com" && password === "password123") {
      set({ user: { email: "asha@acme.com", name: "Asha Singh" } });
      return true;
    }
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
    if (code === "864114") {
      const state = get();
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

