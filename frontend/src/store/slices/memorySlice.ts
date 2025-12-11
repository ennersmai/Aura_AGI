import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Memory {
  id: string;
  content: string;
  created_at: string;
  importance: number;
  source: string;
}

interface MemoryState {
  memories: Memory[];
  loading: boolean;
  error: string | null;
  relevantMemories: Memory[];
}

const initialState: MemoryState = {
  memories: [],
  loading: false,
  error: null,
  relevantMemories: [],
};

const memorySlice = createSlice({
  name: 'memory',
  initialState,
  reducers: {
    setMemories(state, action: PayloadAction<Memory[]>) {
      state.memories = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRelevantMemories(state, action: PayloadAction<Memory[]>) {
      state.relevantMemories = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearMemories(state) {
      state.memories = [];
      state.relevantMemories = [];
    },
  },
});

export const { 
  setMemories, 
  setRelevantMemories, 
  setLoading, 
  setError,
  clearMemories 
} = memorySlice.actions;

export default memorySlice.reducer;