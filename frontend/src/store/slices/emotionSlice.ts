import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '@/services/apiService';
import { EmotionalState } from '@/services/socketService';

interface EmotionState {
  currentState: EmotionalState;
  history: Array<{
    timestamp: string;
    state: EmotionalState;
  }>;
  dominantEmotions: Array<{
    emotion: string;
    value: number;
  }>;
  isLoading: boolean;
  error: string | null;
  timeframe: 'day' | 'week' | 'month';
}

const initialState: EmotionState = {
  currentState: {},
  history: [],
  dominantEmotions: [],
  isLoading: false,
  error: null,
  timeframe: 'day'
};

// Async thunks for API interactions
export const fetchEmotionalState = createAsyncThunk(
  'emotion/fetchEmotionalState',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.getEmotionalState();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchEmotionalHistory = createAsyncThunk(
  'emotion/fetchEmotionalHistory',
  async (timeframe: 'day' | 'week' | 'month', { rejectWithValue }) => {
    try {
      return await apiService.getEmotionalHistory(timeframe);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const emotionSlice = createSlice({
  name: 'emotion',
  initialState,
  reducers: {
    setTimeframe(state, action: PayloadAction<'day' | 'week' | 'month'>) {
      state.timeframe = action.payload;
    },
    updateEmotionalState(state, action: PayloadAction<EmotionalState>) {
      state.currentState = action.payload;
      
      // Calculate dominant emotions (top 3)
      const emotions = Object.entries(action.payload)
        .map(([emotion, value]) => ({ emotion, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);
      
      state.dominantEmotions = emotions;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch emotional state
      .addCase(fetchEmotionalState.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmotionalState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentState = action.payload;
        
        // Calculate dominant emotions
        const emotions = Object.entries(action.payload)
          .map(([emotion, value]) => ({ emotion, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);
        
        state.dominantEmotions = emotions;
      })
      .addCase(fetchEmotionalState.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch emotional history
      .addCase(fetchEmotionalHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmotionalHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchEmotionalHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setTimeframe, updateEmotionalState } = emotionSlice.actions;

export default emotionSlice.reducer; 