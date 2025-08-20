import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const ChartComponents = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderBloodTypeDistribution = () => {
    if (!data.bloodTypeStats) return null;

    const chartData = Object.entries(data.bloodTypeStats).map(([bloodType, stats]) => ({
      bloodType,
      total: stats.total || 0,
      available: stats.available || 0
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Blood Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bloodType" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Total Units" />
            <Bar dataKey="available" fill="#82ca9d" name="Available Units" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderStatusBreakdown = () => {
    if (!data.statusBreakdown) return null;

    const chartData = Object.entries(data.statusBreakdown).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderTrendAnalysis = () => {
    if (!data.trendData) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="donations" stroke="#8884d8" name="Donations" />
            <Line type="monotone" dataKey="requests" stroke="#82ca9d" name="Requests" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!data.performanceMetrics) return null;

    const metrics = [
      { name: 'Response Time', value: data.performanceMetrics.averageResponseTime, unit: 'hours' },
      { name: 'Fulfillment Rate', value: data.performanceMetrics.fulfillmentRate, unit: '%' },
      { name: 'Donation Rate', value: data.performanceMetrics.donationRate, unit: '%' },
      { name: 'Wastage Rate', value: data.performanceMetrics.wastageRate, unit: '%' }
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
               {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
               {metric.unit}
             </p>
             <p className="text-sm text-gray-600">{metric.name}</p>
           </div>
         ))}
       </div>
     </div>
   );
 };

 return (
   <div className="space-y-6">
     {renderBloodTypeDistribution()}
     {renderStatusBreakdown()}
     {renderTrendAnalysis()}
     {renderPerformanceMetrics()}
   </div>
 );
};

export default ChartComponents;