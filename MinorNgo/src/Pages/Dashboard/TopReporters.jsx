import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TopReporters = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const lost = await axios.get('http://localhost:3001/api/children/lost');
        const missing = await axios.get('http://localhost:3001/api/children/missingchildren/all');

        const reportMap = {};

        // Merge both lost & missing reports and count by submittedBy._id
        [...lost.data, ...missing.data].forEach(entry => {
          const user = entry.submittedBy;
          const userId = typeof user === 'object' ? user._id : user;
          const userName = typeof user === 'object'
            ? user.name
            : `User ${userId?.slice(-4) || 'N/A'}`;

          if (!reportMap[userId]) {
            reportMap[userId] = { name: userName, count: 1 };
          } else {
            reportMap[userId].count += 1;
          }
        });

        // Sort top 5
        const topUsers = Object.values(reportMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const data = {
          labels: topUsers.map(user => user.name),
          datasets: [
            {
              label: 'Total Reports',
              data: topUsers.map(user => user.count),
              backgroundColor: '#3498db',
              borderRadius: 6,
              barThickness: 45
            }
          ]
        };

        setChartData(data);
      } catch (error) {
        console.error('Error fetching reporter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div
      style={{
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: '#ffffff',
        boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
        width: '100%'
      }}
    >
      <h3 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '20px' }}>Top Reporters</h3>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading chart...</p>
      ) : chartData && chartData.labels.length > 0 ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            }
          }}
        />
      ) : (
        <p style={{ textAlign: 'center' }}>No data available</p>
      )}
    </div>
  );
};

export default TopReporters;
