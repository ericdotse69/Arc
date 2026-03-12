import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { statsAPI, WeeklyStats } from '../api/statsAPI';

export function Dashboard(): JSX.Element {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Fetching stats from API...');
        const data = await statsAPI.getWeeklyStats();
        console.log('Stats received:', data);
        setStats(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load analytics';
        console.error('Failed to fetch stats:', errorMsg, err);
        // Set empty stats instead of error to show dashboard structure
        setStats({
          totalHours: 0,
          averageCognitiveLoad: 0,
          averageFlowScore: 0,
          totalSessions: 0,
          peakHour: null,
          categoryBreakdown: [],
          taskBreakdown: [],
          sessionsLast7Days: [],
        });
        setError(null); // Don't show as error - it's just no data yet
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-8 py-8">
        <p className="text-[#52525b] text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-8 py-8">
        <div className="border-[1px] border-[#dc2626] bg-[#09090b] p-6 max-w-md">
          <p className="text-[#dc2626] text-sm font-bold">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-8 py-8">
        <div className="border-[1px] border-[#dc2626] bg-[#09090b] p-6 max-w-md">
          <p className="text-[#dc2626] text-sm font-bold">No data available</p>
        </div>
      </div>
    );
  }

  const hasData = stats.totalSessions > 0;

  return (
    <div className="min-h-screen bg-[#09090b] px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b-[1px] border-[#52525b] pb-8 mb-8">
          <h1 className="text-4xl font-black text-[#fafafa] uppercase tracking-tight mb-2">
            Analytics
          </h1>
          <p className="text-[#52525b] text-sm">Last 7 days • Deep work quantified</p>
        </div>

        {!hasData && (
          <div className="mb-8 border-[1px] border-[#52525b] p-6 bg-[#09090b]">
            <p className="text-[#52525b] text-sm">
              No sessions logged yet. Start a focus session to see your analytics.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {/* Total Hours */}
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b]">
            <p className="text-[#52525b] text-xs uppercase font-bold tracking-[0.1em] mb-4">
              Total Focus Hours
            </p>
            <div
              className="text-5xl font-black text-[#dc2626] mb-2"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {stats.totalHours}h
            </div>
            <p className="text-[#52525b] text-xs">
              {stats.totalSessions} sessions completed
            </p>
          </div>

          {/* Avg Cognitive Load */}
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b]">
            <p className="text-[#52525b] text-xs uppercase font-bold tracking-[0.1em] mb-4">
              Avg Cognitive Load
            </p>
            <div
              className="text-5xl font-black text-[#dc2626] mb-2"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {stats.averageCognitiveLoad} / 10
            </div>
            <p className="text-[#52525b] text-xs">Mental demand intensity</p>
          </div>

          {/* Avg Flow Score */}
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b]">
            <p className="text-[#52525b] text-xs uppercase font-bold tracking-[0.1em] mb-4">
              Avg Flow Score
            </p>
            <div
              className="text-5xl font-black text-[#dc2626] mb-2"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {stats.averageFlowScore} / 100
            </div>
            <p className="text-[#52525b] text-xs">Session quality metric</p>
          </div>

          {/* Total Sessions */}
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b]">
            <p className="text-[#52525b] text-xs uppercase font-bold tracking-[0.1em] mb-4">
              Sessions
            </p>
            <div
              className="text-5xl font-black text-[#dc2626] mb-2"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {stats.totalSessions}
            </div>
            <p className="text-[#52525b] text-xs">Focus blocks this week</p>
          </div>

          {/* Peak Performance Hour */}
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b]">
            <p className="flex items-center justify-between text-[#52525b] text-xs uppercase font-bold tracking-[0.1em] mb-4">
              Peak Hour
              <span
                title="Hour of day when you started the most sessions."
                className="text-[#52525b] cursor-help"
              >
                ℹ️
              </span>
            </p>
            {stats.peakHour !== null ? (
              <>
                <div
                  className="text-5xl font-black text-[#dc2626] mb-2"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {String(stats.peakHour).padStart(2, '0')}:00
                </div>
                <p className="text-[#52525b] text-xs">Most productive hour</p>
              </>
            ) : (
              <>
                <div className="text-5xl font-black text-[#52525b] mb-2">—</div>
                <p className="text-[#52525b] text-xs">No session data yet</p>
              </>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b] mb-12">
            <h2 className="text-lg font-bold text-[#fafafa] uppercase tracking-[0.05em] mb-6">
              Time by Category
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {stats.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex justify-between">
                  <span className="text-[#fafafa]">{cat.category}</span>
                  <span className="text-[#dc2626] font-black" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {cat.duration}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Breakdown - Shows time per task to identify time leaks */}
        {stats.taskBreakdown && stats.taskBreakdown.length > 0 && (
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b] mb-12">
            <h2 className="text-lg font-bold text-[#fafafa] uppercase tracking-[0.05em] mb-6">
              Time Per Task
              <span
                title="Your focus time broken down by task. Identify which tasks consume your time."
                className="text-[#52525b] text-sm ml-2 cursor-help"
              >
                ℹ️
              </span>
            </h2>

            {/* Task duration list */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {stats.taskBreakdown.map((task) => (
                <div key={`${task.taskId}-${task.taskTitle}`} className="border-b-[1px] border-[#52525b] pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#fafafa] font-medium truncate flex-1">
                      {task.taskTitle}
                    </span>
                    <span className="text-[#dc2626] font-black ml-4" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {task.duration}m
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-[#18181b] border-[1px] border-[#52525b]">
                      <div
                        className="h-full bg-[#dc2626]"
                        style={{
                          width: `${Math.min(
                            (task.duration / Math.max(...stats.taskBreakdown.map((t) => t.duration), 60)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[#52525b] text-xs whitespace-nowrap">
                      {task.count} session{task.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pie chart visualization */}
            {stats.taskBreakdown.length > 0 && (
              <div className="mt-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.taskBreakdown}
                      dataKey="duration"
                      nameKey="taskTitle"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.taskTitle} (${entry.duration}m)`}
                      labelLine={false}
                    >
                      {stats.taskBreakdown.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#dc2626', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'][index % 8]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#09090b',
                        border: '1px solid #52525b',
                        borderRadius: '0px',
                      }}
                      labelStyle={{ color: '#fafafa' }}
                      formatter={(value) => `${value}m`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b]">
          <h2 className="text-lg font-bold text-[#fafafa] uppercase tracking-[0.05em] mb-6">
            Daily Focus Time
          </h2>

          {stats.sessionsLast7Days.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.sessionsLast7Days}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="0"
                  stroke="#52525b"
                  vertical={false}
                  horizontalPoints={[0]}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#52525b', fontSize: 12 }}
                  axisLine={{ stroke: '#52525b' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fill: '#52525b', fontSize: 12 }}
                  axisLine={{ stroke: '#52525b' }}
                  label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    border: '1px solid #52525b',
                    borderRadius: '0px',
                  }}
                  labelStyle={{ color: '#fafafa' }}
                  formatter={(value) => `${value}min`}
                />
                <Bar dataKey="duration" fill="#dc2626" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#52525b] text-sm">No session data available yet.</p>
            </div>
          )}
        </div>

        {/* Daily Breakdown */}
        {stats.sessionsLast7Days.length > 0 && (
          <div className="border-[1px] border-[#52525b] p-8 bg-[#09090b] mt-8">
            <h2 className="text-lg font-bold text-[#fafafa] uppercase tracking-[0.05em] mb-6">
              Daily Breakdown
            </h2>

            <div className="space-y-4">
              {stats.sessionsLast7Days.map((day) => (
                <div key={day.date} className="border-b-[1px] border-[#52525b] pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[#fafafa] font-mono text-sm">{day.date}</p>
                      <p className="text-[#52525b] text-xs">
                        {day.count} session{day.count !== 1 ? 's' : ''} • {day.duration}min total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#dc2626] font-bold text-sm">
                        Cognitive Load: {day.avgCognitiveLoad}
                      </p>
                    </div>
                  </div>

                  {/* Visual bar */}
                  <div className="h-2 bg-[#18181b] border-[1px] border-[#52525b]">
                    <div
                      className="h-full bg-[#dc2626]"
                      style={{
                        width: `${Math.min((day.duration / 120) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
