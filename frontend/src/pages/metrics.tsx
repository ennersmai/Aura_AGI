import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps
} from 'recharts';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AppLayout from '../components/layout/Layout';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Define interfaces for the metrics data
interface DataPoint {
  label: string;
  value: number;
  timestamp?: string;
}

interface EmotionData {
  name: string;
  value: number;
}

interface EmotionSeriesData {
  name: string;
  data: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface MemoryData {
  id: string;
  content: string;
  importance: number;
  created_at: string;
  source?: string;
}

interface InsightData {
  content: string;
  category?: string;
  importance?: number;
  created_at: string;
}

interface MetricsData {
  platform: {
    total_messages: number;
    total_conversations: number;
    active_users: number;
    avg_response_time: number;
    conversation_length_avg: number;
    messages_per_day: {
      data: DataPoint[];
    };
    performance_metrics: {
      cpu_usage: {
        data: Array<{
          timestamp: string;
          value: number;
        }>;
      };
    };
  };
  memory: {
    total_memories: number;
    importance_distribution: Record<string, number>;
    memory_usage_trend: {
      data: DataPoint[];
    };
    recent_memories: MemoryData[];
  };
  emotion: {
    current_state: Record<string, number>;
    dominant_emotions: EmotionData[];
    history: EmotionSeriesData[];
    triggers: Record<string, string[]>;
  };
  reflection: {
    total_reflections: number;
    reflection_frequency: {
      data: DataPoint[];
    };
    recent_insights: InsightData[];
    categorized_insights: Record<string, InsightData[]>;
  };
  updated_at: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`metrics-tabpanel-${index}`}
      aria-labelledby={`metrics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Metrics page component
export default function MetricsPage() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(7);

  // COLORS for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await axios.get<MetricsData>(`${API_BASE_URL}/metrics?days=${timeRange}`);
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeRange]);

  // Handle tab change
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Handle time range change
  const handleTimeRangeChange = (days: number) => {
    setTimeRange(days);
  };

  if (loading) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Aura Platform Metrics
        </Typography>
        
        {/* Time range selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Time Range:
          </Typography>
          <Box display="flex" gap={1}>
            {[7, 14, 30, 90].map((days) => (
              <Chip 
                key={days}
                label={`${days} days`}
                onClick={() => handleTimeRangeChange(days)}
                color={timeRange === days ? "primary" : "default"}
                variant={timeRange === days ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="metrics tabs">
            <Tab label="Overview" />
            <Tab label="Platform" />
            <Tab label="Memory" />
            <Tab label="Emotion" />
            <Tab label="Reflection" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            {/* Platform Stats */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Platform Statistics" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h3" color="primary">
                        {metrics?.platform?.total_messages.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Messages
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3" color="secondary">
                        {metrics?.platform?.total_conversations.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Conversations
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3" color="success.main">
                        {metrics?.platform?.active_users.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3" color="info.main">
                        {metrics?.platform?.avg_response_time.toFixed(2)}s
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Response Time
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Memory Stats */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Memory Statistics" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h3" color="primary">
                        {metrics?.memory?.total_memories.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Memories
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3" color="secondary">
                        {metrics?.reflection?.total_reflections.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Reflections
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                        Dominant Emotions:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {metrics?.emotion?.dominant_emotions.slice(0, 3).map((emotion, index) => (
                          <Chip 
                            key={index}
                            label={`${emotion.name}: ${(emotion.value * 100).toFixed(0)}%`}
                            size="small"
                            sx={{ bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Messages Per Day */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Messages Per Day" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics?.platform?.messages_per_day?.data || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Messages" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Platform Tab */}
        <TabPanel value={value} index={1}>
          <Grid container spacing={3}>
            {/* Platform Stats */}
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardHeader title="Usage Statistics" />
                <CardContent>
                  <List>
                    <ListItem divider>
                      <ListItemText 
                        primary="Total Messages" 
                        secondary={metrics?.platform?.total_messages.toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText 
                        primary="Total Conversations" 
                        secondary={metrics?.platform?.total_conversations.toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText 
                        primary="Active Users" 
                        secondary={metrics?.platform?.active_users.toLocaleString()} 
                      />
                    </ListItem>
                    <ListItem divider>
                      <ListItemText 
                        primary="Avg Response Time" 
                        secondary={`${metrics?.platform?.avg_response_time.toFixed(2)}s`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Avg Conversation Length" 
                        secondary={`${metrics?.platform?.conversation_length_avg.toFixed(1)} messages`} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Messages Per Day */}
            <Grid item xs={12} md={6} lg={8}>
              <Card>
                <CardHeader title="Messages Per Day" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics?.platform?.messages_per_day?.data || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Messages" fill={theme.palette.primary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Performance Metrics */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="System Performance" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={metrics?.platform?.performance_metrics?.cpu_usage?.data || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value: string) => {
                            if (!value) return '';
                            try {
                              const date = new Date(value);
                              return `${date.getHours()}:00`;
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (_e) {
                              return '';
                            }
                          }}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value: string) => {
                            if (!value) return '';
                            try {
                              const date = new Date(value);
                              return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (_e) {
                              return '';
                            }
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="CPU Usage (%)" 
                          stroke={theme.palette.primary.main} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Memory Tab */}
        <TabPanel value={value} index={2}>
          <Grid container spacing={3}>
            {/* Memory Stats */}
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardHeader title="Memory Statistics" />
                <CardContent>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {metrics?.memory?.total_memories.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Memories
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                    Importance Distribution:
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(metrics?.memory?.importance_distribution || {}).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: PieLabelRenderProps) => `${name}: ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                        >
                          {Object.entries(metrics?.memory?.importance_distribution || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => value.toLocaleString()} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Memory Growth */}
            <Grid item xs={12} md={6} lg={8}>
              <Card>
                <CardHeader title="Memory Growth Over Time" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={metrics?.memory?.memory_usage_trend?.data || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Total Memories" 
                          stroke={theme.palette.primary.main} 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Memories */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Recent Memories" />
                <CardContent>
                  <List>
                    {metrics?.memory?.recent_memories.map((memory, index) => (
                      <ListItem key={index} divider={index < (metrics.memory.recent_memories.length - 1)}>
                        <ListItemText
                          primary={memory.content}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                Importance: {memory.importance.toFixed(2)}
                              </Typography>
                              {" — "}
                              {memory.created_at && new Date(memory.created_at).toLocaleString()}
                              {memory.source && ` — Source: ${memory.source}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Emotion Tab */}
        <TabPanel value={value} index={3}>
          <Grid container spacing={3}>
            {/* Current Emotional State */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Current Emotional State" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(metrics?.emotion?.current_state || {}).map(([name, value]) => ({ name, value }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }: PieLabelRenderProps) => `${name}: ${(percent ? (percent * 100).toFixed(0) : 0)}%`}
                        >
                          {Object.entries(metrics?.emotion?.current_state || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => (Number(value) * 100).toFixed(0) + '%'} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Dominant Emotions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Dominant Emotions" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={metrics?.emotion?.dominant_emotions || []}
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 1]} tickFormatter={(value: number) => (value * 100).toFixed(0) + '%'} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value: number) => (Number(value) * 100).toFixed(0) + '%'} />
                        <Bar dataKey="value" fill={theme.palette.primary.main}>
                          {(metrics?.emotion?.dominant_emotions || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Emotion History */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Emotion History" />
                <CardContent>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="timestamp" 
                          allowDuplicatedCategory={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value: string) => {
                            if (!value) return '';
                            try {
                              const date = new Date(value);
                              return `${date.getMonth()+1}/${date.getDate()}`;
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (_e) {
                              return '';
                            }
                          }}
                        />
                        <YAxis domain={[0, 1]} tickFormatter={(value: number) => (value * 100).toFixed(0) + '%'} />
                        <Tooltip 
                          formatter={(value: number) => (Number(value) * 100).toFixed(0) + '%'}
                          labelFormatter={(value: string) => {
                            if (!value) return '';
                            try {
                              const date = new Date(value);
                              return date.toLocaleString();
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (_e) {
                              return '';
                            }
                          }}
                        />
                        <Legend />
                        {metrics?.emotion?.history.map((series, index) => (
                          <Line 
                            key={index}
                            type="monotone" 
                            data={series.data}
                            dataKey="value" 
                            name={series.name} 
                            stroke={COLORS[index % COLORS.length]} 
                            activeDot={{ r: 8 }} 
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Emotional Triggers */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Emotional Triggers" />
                <CardContent>
                  <Grid container spacing={2}>
                    {Object.entries(metrics?.emotion?.triggers || {}).map(([emotion, triggers], index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Typography variant="subtitle1" color={COLORS[index % COLORS.length]}>
                          {emotion}
                        </Typography>
                        <List dense>
                          {(triggers as string[]).map((trigger, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={trigger} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Reflection Tab */}
        <TabPanel value={value} index={4}>
          <Grid container spacing={3}>
            {/* Reflection Stats */}
            <Grid item xs={12} md={6} lg={4}>
              <Card>
                <CardHeader title="Reflection Statistics" />
                <CardContent>
                  <Typography variant="h3" color="primary" gutterBottom>
                    {metrics?.reflection?.total_reflections.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Reflections
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Reflection Frequency */}
            <Grid item xs={12} md={6} lg={8}>
              <Card>
                <CardHeader title="Reflection Frequency" />
                <CardContent>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics?.reflection?.reflection_frequency?.data || []}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Reflections" fill={theme.palette.secondary.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Insights */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Recent Insights" />
                <CardContent>
                  <List>
                    {metrics?.reflection?.recent_insights.map((insight, index) => (
                      <ListItem key={index} divider={index < (metrics.reflection.recent_insights.length - 1)}>
                        <ListItemText
                          primary={insight.content}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {insight.category && `Category: ${insight.category}`}
                                {insight.importance && ` — Importance: ${insight.importance.toFixed(2)}`}
                              </Typography>
                              {" — "}
                              {insight.created_at && new Date(insight.created_at).toLocaleString()}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Categorized Insights */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Insights by Category" />
                <CardContent>
                  <Grid container spacing={3}>
                    {Object.entries(metrics?.reflection?.categorized_insights || {}).map(([category, insights], index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Typography variant="h6" gutterBottom>
                          {category}
                        </Typography>
                        <List dense>
                          {insights.map((insight, idx) => (
                            <ListItem key={idx} divider={idx < insights.length - 1}>
                              <ListItemText
                                primary={insight.content}
                                secondary={
                                  <React.Fragment>
                                    <Typography component="span" variant="body2" color="text.secondary">
                                      Importance: {insight.importance?.toFixed(2)}
                                      {" — "}
                                      {insight.created_at && new Date(insight.created_at).toLocaleString()}
                                    </Typography>
                                  </React.Fragment>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {metrics?.updated_at ? new Date(metrics.updated_at).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
      </Container>
    </AppLayout>
  );
} 