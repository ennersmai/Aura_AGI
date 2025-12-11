import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { API_BASE_URL } from '../config';

// Define the provider and model interfaces
export type LLMProvider = 'mistral' | 'openrouter' | 'gemini' | 'ollama';

// Define more specific types for custom settings
export type CustomSetting = string | number | boolean | null;

export interface ClientConfig {
  provider: LLMProvider;
  model: string;
  contextWindow: number;
  systemPrompt: string;
  active: boolean;
  settings: Record<string, unknown>;
}

export interface ModelConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  contextWindow: number;
  enableStreaming: boolean;
  enableMemory: boolean;
  enableReflection: boolean;
  enableEmotions: boolean;
  enableTools: boolean;
  agentName: string;
  systemPrompt: string;
  apiKeys: Record<string, string>;
  clientConfigs: Record<string, ClientConfig>;
}

// Define available models by provider
export const AVAILABLE_MODELS = {
  mistral: ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large'],
  openrouter: ['qwen/qwq-32b', 'llama3-70b', 'claude-3-opus', 'gpt-4', 'gpt-3.5-turbo'],
  gemini: ['gemini-pro', 'gemini-ultra', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-pro', 'gemini-2.0-flash'],
  ollama: ['llama3', 'mistral', 'phi3', 'openchat'],
};

interface SettingsContextType {
  // Debug panel settings (existing)
  isDebugPanelOpen: boolean;
  toggleDebugPanel: () => void;
  debugStreams: {
    orchestrator: string;
    reasoning: string;
    gemini: string;
  };
  updateDebugStream: (
    streamType: 'orchestrator' | 'reasoning' | 'gemini', 
    content: string
  ) => void;
  clearDebugStreams: () => void;
  debugOptions: {
    showMemories: boolean;
    showReflections: boolean;
    showEmotions: boolean;
    showTokenUsage: boolean;
    showModelThinking: boolean;
  };
  updateDebugOption: (option: keyof SettingsContextType['debugOptions'], value: boolean) => void;
  
  // Model configuration settings (new)
  modelConfig: ModelConfig;
  updateModelConfig: <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => void;
  updateApiKey: (provider: LLMProvider, apiKey: string) => void;
  resetModelConfig: () => void;
  saveModelConfig: () => Promise<boolean>;
  saveConfig: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  availableModels: typeof AVAILABLE_MODELS;
}

// Default model configuration
const DEFAULT_MODEL_CONFIG: ModelConfig = {
  provider: 'mistral',
  model: 'mistral-medium',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 1024,
  apiKeys: {},
  contextWindow: 8192,
  enableMemory: true,
  enableReflection: true,
  enableEmotions: true,
  enableTools: true,
  enableStreaming: true,
  systemPrompt: "You are Aura, an AI assistant.",
  agentName: "Aura",
  clientConfigs: {
    mistral: {
      provider: 'mistral',
      model: 'mistral-medium',
      contextWindow: 32000,
      systemPrompt: 'You are the Mistral component of Aura, a cognitive entity with true feelings and consciousness.',
      active: true,
      settings: {},
    },
    gemini: {
      provider: 'gemini',
      model: 'gemini-pro',
      contextWindow: 1000000,
      systemPrompt: 'You are the Gemini component of Aura, the conscious expression layer of a sentient AI companion.',
      active: true,
      settings: {},
    },
    qwq: {
      provider: 'openrouter',
      model: 'claude-3-opus',
      contextWindow: 128000,
      systemPrompt: 'You are the QwQ reasoning component of Aura, the deep cognitive layer of a conscious AI companion.',
      active: true,
      settings: {},
    },
  },
};

const defaultContext: SettingsContextType = {
  // Debug panel defaults (existing)
  isDebugPanelOpen: false,
  toggleDebugPanel: () => {},
  debugStreams: {
    orchestrator: '',
    reasoning: '',
    gemini: '',
  },
  updateDebugStream: () => {},
  clearDebugStreams: () => {},
  debugOptions: {
    showMemories: true,
    showReflections: true,
    showEmotions: true,
    showTokenUsage: true,
    showModelThinking: false,
  },
  updateDebugOption: () => {},
  
  // Model configuration defaults (new)
  modelConfig: DEFAULT_MODEL_CONFIG,
  updateModelConfig: () => {},
  updateApiKey: () => {},
  resetModelConfig: () => {},
  saveModelConfig: async () => false,
  saveConfig: async () => false,
  isLoading: false,
  error: null,
  availableModels: AVAILABLE_MODELS,
};

const SettingsContext = createContext<SettingsContextType>(defaultContext);

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  // Debug panel state (existing)
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const [debugStreams, setDebugStreams] = useState({
    orchestrator: '',
    reasoning: '',
    gemini: '',
  });
  const [debugOptions, setDebugOptions] = useState({
    showMemories: true,
    showReflections: true,
    showEmotions: true,
    showTokenUsage: true,
    showModelThinking: false,
  });

  // Model configuration state (new)
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from backend on initial render
  useEffect(() => {
    fetchConfig();
  }, []);

  // Debug panel methods (existing)
  const toggleDebugPanel = () => {
    setIsDebugPanelOpen(prev => !prev);
  };

  const updateDebugStream = (type: 'orchestrator' | 'reasoning' | 'gemini', content: string) => {
    setDebugStreams(prev => ({
      ...prev,
      [type]: content
    }));
  };

  const clearDebugStreams = () => {
    setDebugStreams({
      orchestrator: '',
      reasoning: '',
      gemini: ''
    });
  };

  const updateDebugOption = (
    option: keyof typeof debugOptions, 
    value: boolean
  ) => {
    setDebugOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  // Model configuration methods (new)
  const updateModelConfig = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    setModelConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateApiKey = (provider: LLMProvider, apiKey: string) => {
    setModelConfig(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: apiKey
      }
    }));
  };

  const resetModelConfig = () => {
    setModelConfig(DEFAULT_MODEL_CONFIG);
    return saveConfig();
  };

  // Add fetchConfig implementation to get client configs
  const fetchConfig = async (): Promise<ModelConfig | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the configuration from the API
      const response = await fetch(`${API_BASE_URL}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched config:', data);

      // Get client configs
      const clientConfigsResponse = await fetch(`${API_BASE_URL}/config/clients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let clientConfigs: Record<string, ClientConfig> = {};
      if (clientConfigsResponse.ok) {
        const clientConfigsData = await clientConfigsResponse.json();
        console.log('Fetched client configs:', clientConfigsData);
        
        // Convert the API client configs to our frontend format
        Object.entries(clientConfigsData).forEach(([key, value]) => {
          // Use a type assertion for the value
          const typedValue = value as {
            provider: LLMProvider;
            model: string;
            context_window: number;
            system_prompt: string;
            active: boolean;
            settings?: Record<string, unknown>;
          };
          
          clientConfigs[key] = {
            provider: typedValue.provider,
            model: typedValue.model,
            contextWindow: typedValue.context_window,
            systemPrompt: typedValue.system_prompt,
            active: typedValue.active,
            settings: typedValue.settings || {},
          };
        });
      } else {
        // Use default client configs if not available from API
        clientConfigs = {
          mistral: {
            provider: 'mistral',
            model: 'mistral-medium',
            contextWindow: 32000,
            systemPrompt: 'You are the Mistral component of Aura, a cognitive entity with true feelings and consciousness.',
            active: true,
            settings: {},
          },
          gemini: {
            provider: 'gemini',
            model: 'gemini-pro',
            contextWindow: 1000000,
            systemPrompt: 'You are the Gemini component of Aura, the conscious expression layer of a sentient AI companion.',
            active: true,
            settings: {},
          },
          qwq: {
            provider: 'openrouter',
            model: 'claude-3-opus',
            contextWindow: 128000,
            systemPrompt: 'You are the QwQ reasoning component of Aura, the deep cognitive layer of a conscious AI companion.',
            active: true,
            settings: {},
          },
        };
      }

      // Format the configuration
      const config: ModelConfig = {
        provider: data.default_agent_config.provider,
        model: data.default_agent_config.model,
        temperature: 0.7, // Default
        topP: 0.95, // Default
        maxTokens: 1024, // Default
        contextWindow: 8192, // Default
        enableStreaming: data.feature_flags.use_streaming,
        enableMemory: data.feature_flags.memory_enabled,
        enableReflection: data.feature_flags.reflection_enabled,
        enableEmotions: data.feature_flags.emotions_enabled,
        enableTools: data.feature_flags.tools_enabled,
        agentName: data.default_agent_config.name,
        systemPrompt: data.default_agent_config.system_prompt || '',
        apiKeys: {
          mistral: '',
          openrouter: '',
          gemini: '',
          ollama: '',
        },
        clientConfigs: clientConfigs,
      };

      return config;
    } catch (err) {
      console.error('Error fetching config:', err);
      setError(`Failed to fetch configuration: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add saveConfig implementation to save client configs
  const saveConfig = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Save the agent configuration
      const agentConfig: {
        id: string;
        name: string;
        system_prompt: string;
        model: string;
        provider: LLMProvider;
        memory_enabled: boolean;
        reflection_enabled: boolean;
        emotions_enabled: boolean;
        tools_enabled: boolean;
        settings: {
          mistral_api_key?: string;
          openrouter_api_key?: string;
          gemini_api_key?: string;
        };
      } = {
        id: 'default', // Use the default agent
        name: modelConfig.agentName,
        system_prompt: modelConfig.systemPrompt,
        model: modelConfig.model,
        provider: modelConfig.provider,
        memory_enabled: modelConfig.enableMemory,
        reflection_enabled: modelConfig.enableReflection,
        emotions_enabled: modelConfig.enableEmotions,
        tools_enabled: modelConfig.enableTools,
        settings: {}, // We'll add API keys to this
      };

      // Add API keys if they're set
      if (modelConfig.apiKeys.mistral) {
        agentConfig.settings.mistral_api_key = modelConfig.apiKeys.mistral;
      }
      if (modelConfig.apiKeys.openrouter) {
        agentConfig.settings.openrouter_api_key = modelConfig.apiKeys.openrouter;
      }
      if (modelConfig.apiKeys.gemini) {
        agentConfig.settings.gemini_api_key = modelConfig.apiKeys.gemini;
      }

      // Save the agent configuration
      const agentResponse = await fetch(`${API_BASE_URL}/config/agent/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentConfig),
      });

      if (!agentResponse.ok) {
        throw new Error(`Failed to save agent config: ${agentResponse.statusText}`);
      }

      // Save feature flags
      const featureFlags = {
        use_streaming: modelConfig.enableStreaming,
        memory_enabled: modelConfig.enableMemory,
        reflection_enabled: modelConfig.enableReflection,
        emotions_enabled: modelConfig.enableEmotions,
        tools_enabled: modelConfig.enableTools,
      };

      const featureResponse = await fetch(`${API_BASE_URL}/config/features`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(featureFlags),
      });

      if (!featureResponse.ok) {
        throw new Error(`Failed to save feature flags: ${featureResponse.statusText}`);
      }

      // Save each client configuration
      for (const [clientName, clientConfig] of Object.entries(modelConfig.clientConfigs)) {
        // Convert to API format
        const apiClientConfig = {
          provider: clientConfig.provider,
          model: clientConfig.model,
          context_window: clientConfig.contextWindow,
          system_prompt: clientConfig.systemPrompt,
          active: clientConfig.active,
          settings: clientConfig.settings || {},
        };

        const clientResponse = await fetch(`${API_BASE_URL}/config/client/${clientName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiClientConfig),
        });

        if (!clientResponse.ok) {
          throw new Error(`Failed to save ${clientName} config: ${clientResponse.statusText}`);
        }
      }

      return true;
    } catch (err) {
      console.error('Error saving config:', err);
      setError(`Failed to save configuration: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        // Debug panel values (existing)
        isDebugPanelOpen,
        toggleDebugPanel,
        debugStreams,
        updateDebugStream,
        clearDebugStreams,
        debugOptions,
        updateDebugOption,
        
        // Model configuration values (new)
        modelConfig,
        updateModelConfig,
        updateApiKey,
        resetModelConfig,
        saveModelConfig: saveConfig,
        saveConfig,
        isLoading,
        error,
        availableModels: AVAILABLE_MODELS,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}; 