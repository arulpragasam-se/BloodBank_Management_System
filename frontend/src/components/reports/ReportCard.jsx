const ReportCard = ({ report, onGenerate, loading }) => {
  const IconComponent = report.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-full ${report.color}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
      <p className="text-gray-600 text-sm">{report.description}</p>
    </div>
  );
};

export default ReportCard;