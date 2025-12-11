import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Reflection {
  id: string;
  content: string;
  created_at: string;
  interaction_id: string;
  insights: string[];
  action_items: string[];
}

interface ReflectionState {
  reflections: Reflection[];
  loading: boolean;
  error: string | null;
  activeReflection: Reflection | null;
}

const initialState: ReflectionState = {
  reflections: [],
  loading: false,
  error: null,
  activeReflection: null,
};

const reflectionSlice = createSlice({
  name: 'reflection',
  initialState,
  reducers: {
    setReflections(state, action: PayloadAction<Reflection[]>) {
      state.reflections = action.payload;
      state.loading = false;
      state.error = null;
    },
    addReflection(state, action: PayloadAction<Reflection>) {
      state.reflections.unshift(action.payload); // Add to beginning of array
    },
    setActiveReflection(state, action: PayloadAction<Reflection | null>) {
      state.activeReflection = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearReflections(state) {
      state.reflections = [];
      state.activeReflection = null;
    },
  },
});

export const { 
  setReflections, 
  addReflection,
  setActiveReflection,
  setLoading, 
  setError,
  clearReflections 
} = reflectionSlice.actions;

export default reflectionSlice.reducer;
