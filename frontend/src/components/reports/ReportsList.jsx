import { BarChart3, Calendar, FileText, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { reportService } from '../../services/reportService';
import Toast from '../common/Toast';
import ReportCard from './ReportCard';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    {
      id: 'donors',
      title: 'Donor Report',
      description: 'Comprehensive analysis of donor demographics, eligibility, and donation patterns',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      generate: () => generateReport('donors')
    },
    {
      id: 'inventory',
      title: 'Blood Inventory Report',
      description: 'Current stock levels, expiry analysis, and blood type distribution',
      icon: BarChart3,
      color: 'bg-red-100 text-red-600',
      generate: () => generateReport('inventory')
    },
    {
      id: 'campaigns',
      title: 'Campaign Performance Report',
      description: 'Campaign effectiveness, participation rates, and success metrics',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      generate: () => generateReport('campaigns')
    },
    {
      id: 'requests',
      title: 'Blood Requests Report',
      description: 'Request fulfillment rates, response times, and hospital performance',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      generate: () => generateReport('requests')
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary',
      description: 'Comprehensive monthly overview of all blood bank activities',
      icon: Calendar,
      color: 'bg-orange-100 text-orange-600',
      generate: () => generateReport('monthly-summary')
    },
    {
      id: 'annual',
      title: 'Annual Report',
      description: 'Yearly performance analysis with trends and achievements',
      icon: TrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
      generate: () => generateReport('annual')
    },
    {
      id: 'wastage',
      title: 'Blood Wastage Report',
      description: 'Analysis of expired blood, wastage causes, and prevention metrics',
      icon: BarChart3,
      color: 'bg-yellow-100 text-yellow-600',
      generate: () => generateReport('wastage')
    },
    {
      id: 'hospital-performance',
      title: 'Hospital Performance Report',
      description: 'Hospital request patterns, response times, and collaboration metrics',
      icon: FileText,
      color: 'bg-teal-100 text-teal-600',
      generate: () => generateReport('hospital-performance')
    }
  ];

  const generateReport = async (type) => {
    try {
      setLoading(true);
      setError('');

      let response;
      const params = { 
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        to: new Date().toISOString()
      };

      switch (type) {
        case 'donors':
          response = await reportService.generateDonorReport(params);
          break;
        case 'inventory':
          response = await reportService.generateInventoryReport(params);
          break;
        case 'campaigns':
          response = await reportService.generateCampaignReport(params);
          break;
        case 'requests':
          response = await reportService.generateRequestsReport(params);
          break;
        case 'monthly-summary':
          response = await reportService.generateMonthlySummary({
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1
          });
          break;
        case 'annual':
          response = await reportService.generateAnnualReport({
            year: new Date().getFullYear()
          });
          break;
        case 'wastage':
          response = await reportService.generateWastageReport(params);
          break;
        case 'hospital-performance':
          response = await reportService.generateHospitalPerformanceReport(params);
          break;
        default:
          throw new Error('Unknown report type');
      }

      if (response.success) {
        const newReport = {
          id: Date.now(),
          type,
          title: reportTypes.find(r => r.id === type)?.title,
          generatedAt: new Date(),
          data: response.data
        };
        setReports(prev => [newReport, ...prev]);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <Toast type="error" message={error} onClose={() => setError('')} />}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <span className="text-sm text-gray-600">
          Generate comprehensive reports for blood bank operations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reportTypes.map((reportType) => (
          <ReportCard
            key={reportType.id}
            report={reportType}
            onGenerate={reportType.generate}
            loading={loading}
          />
        ))}
      </div>

      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recently Generated Reports</h3>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-medium">{report.title}</h4>
                  <p className="text-sm text-gray-600">
                    Generated: {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => window.open(`/reports/view/${report.id}`, '_blank')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Report
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;