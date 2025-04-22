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

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const lostRes = await axios.get('http://localhost:3001/api/children/lost');
        const missingRes = await axios.get('http://localhost:3001/api/children/missingchildren/all');

        const monthMap = {};

        const formatDate = (d) => {
          const date = new Date(d);
          const month = date.toLocaleString('default', { month: 'short' });
          return `${month} ${date.getFullYear()}`;
        };

        const all = [...lostRes.data, ...missingRes.data];

        all.forEach(report => {
          const rawDate = report.dateReported || report.lastSeenDate || report.createdAt || new Date();
          const key = formatDate(rawDate);
          monthMap[key] = (monthMap[key] || 0) + 1;
        });

        const sortedMonths = Object.keys(monthMap).sort((a, b) =>
          new Date('1 ' + a) - new Date('1 ' + b)
        );

        const data = {
          labels: sortedMonths,
          datasets: [
            {
              label: 'Total Reports',
              data: sortedMonths.map(month => monthMap[month]),
              fill: true,
              borderColor: '#2E86C1',
              backgroundColor: 'rgba(46, 134, 193, 0.2)',
              tension: 0.3
            }
          ]
        };

        setChartData(data);
      } catch (err) {
        console.error('Error fetching timeline reports:', err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div style={{
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: '#ffffff',
      boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
      width: '100%'
    }}>
      <h3 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '20px' }}>
        📈 Reports Over Time
      </h3>

      {chartData ? (
        <Line data={chartData} options={{ responsive: true }} />
      ) : (
        <p style={{ textAlign: 'center' }}>Loading chart...</p>
      )}
    </div>
  );
};

export default ReportsOverTime;
