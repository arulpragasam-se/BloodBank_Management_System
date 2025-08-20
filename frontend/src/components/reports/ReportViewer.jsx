import { Download, Eye, Printer, Share2 } from 'lucide-react';
import { useState } from 'react';
import ChartComponents from './ChartComponents';

const ReportViewer = ({ report }) => {
  const [viewMode, setViewMode] = useState('summary');

  const handleDownload = (format) => {
    const data = format === 'csv' ? convertToCSV(report.data) : JSON.stringify(report.data, null, 2);
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || !data.details) return '';
    
    const headers = Object.keys(data.details[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.details.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: report.title,
        text: `Blood Bank Report: ${report.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-600">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              {viewMode === 'summary' ? 'Detailed View' : 'Summary View'}
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            
            <div className="relative">
              <button
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => document.getElementById('download-menu').classList.toggle('hidden')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <div id="download-menu" className="hidden absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleDownload('json')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  JSON
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'summary' ? (
          <div className="space-y-6">
            {report.data.summary && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(report.data.summary).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report.data.charts && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Charts & Analytics</h3>
                <ChartComponents data={report.data} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Detailed Data</h3>
            {report.data.details && report.data.details.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(report.data.details[0]).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.data.details.slice(0, 100).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report.data.details.length > 100 && (
                  <p className="text-center text-gray-500 mt-4">
                    Showing first 100 rows of {report.data.details.length} total rows
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No detailed data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewer;