import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ReportsOverTime = () => {
  const [chartData, setChartData] = useState(null);
  const [filter, setFilter] = useState('month'); // default filter

  const fetchReports = async () => {
    try {
      const lostRes = await axios.get('http://localhost:3001/api/children/lost');
      const missingRes = await axios.get('http://localhost:3001/api/children/missingchildren/all');

      return {
        lost: lostRes.data,
        missing: missingRes.data
      };
    } catch (err) {
      console.error('Error fetching reports:', err);
      return { lost: [], missing: [] };
    }
  };

  const groupReports = (reports, mode) => {
    const counts = {};

    reports.forEach(report => {
      const rawDate = report.dateReported || report.lastSeenDate || report.createdAt || new Date();
      const date = new Date(rawDate);

      let key;
      if (mode === 'date') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (mode === 'month') {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        key = `${date.getFullYear()}-${month}`; // YYYY-MM
      } else if (mode === 'year') {
        key = `${date.getFullYear()}`; // YYYY
      }

      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  };

  const buildChart = (lostCounts, missingCounts, mode) => {
    const allKeys = new Set([...Object.keys(lostCounts), ...Object.keys(missingCounts)]);
    const sortedKeys = Array.from(allKeys).sort();

    const labels = sortedKeys.map(key => {
      if (mode === 'month') {
        const [year, month] = key.split('-');
        const monthName = new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'short' });
        return `${monthName} ${year}`;
      }
      return key;
    });

    const lostData = sortedKeys.map(k => lostCounts[k] || 0);
    const missingData = sortedKeys.map(k => missingCounts[k] || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Lost Reports',
          data: lostData,
          fill: true,
          borderColor: '#E74C3C', // Red line
          backgroundColor: 'rgba(231, 76, 60, 0.2)',
          tension: 0.3
        },
        {
          label: 'Missing Reports',
          data: missingData,
          fill: true,
          borderColor: '#2E86C1', // Blue line
          backgroundColor: 'rgba(46, 134, 193, 0.2)',
          tension: 0.3
        }
      ]
    };
  };

  const updateChart = async () => {
    const { lost, missing } = await fetchReports();
    const lostCounts = groupReports(lost, filter);
    const missingCounts = groupReports(missing, filter);
    const data = buildChart(lostCounts, missingCounts, filter);
    setChartData(data);
  };

  useEffect(() => {
    updateChart();
  }, [filter]);

  return (
    <div style={{
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: '#ffffff',
      boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
      width: '100%'
    }}>
      <h3 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '10px' }}>
        📈 Reports Over Time
      </h3>

      {/* Filter Dropdown */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter By:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="date">Date Wise</option>
          <option value="month">Month Wise</option>
          <option value="year">Year Wise</option>
        </select>
      </div>

      {chartData ? (
        <Line data={chartData} options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: 'index' }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }} />
      ) : (
        <p style={{ textAlign: 'center' }}>Loading chart...</p>
      )}
    </div>
  );
};

export default ReportsOverTime;
