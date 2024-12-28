import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const Piechart = () => {
  const [victimData, setVictimData] = useState([]);
  
  // Fetch data when the component mounts
  useEffect(() => {
    fetch('https://api.data.gov.in/resource/1a00de01-dd7f-41d4-8d29-e6febfff7e2f?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json')
      .then(response => response.json())
      .then(data => {
        // Parse the data and set it for the chart
        const labels = data.records.map(item => item.state_ut);
        const childVictims = data.records.map(item => item.child_victims___total_child_victims___t___col__22_);
        
        setVictimData({ labels, childVictims });
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);
  
  const chartData = {
    labels: victimData.labels || [],
    datasets: [
      {
        data: victimData.childVictims || [],
        backgroundColor: [
          "#FF5733", "#FF8D1A", "#FFDA47", "#FFBD00", "#FFD700",
          "#0D6EFD", "#1E7B00", "#DC3545", "#6F42C1", "#FFC0CB"
        ], // Color for each slice of the pie
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw} victims`; // Custom tooltips
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '70%', height: '70%', marginBottom : '80px' }}>
      <h3>State/UT-wise Number of Child Victims of Kidnapping and Abduction during 2022</h3>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default Piechart;
