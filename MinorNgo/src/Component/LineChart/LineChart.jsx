import React from 'react';
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

const LineGraph = () => {

    // Total missing children each year (manually summed from data above)
    const yearLabels = ['2018', '2019', '2020', '2021', '2022'];
    const missingData = [
        47223, // 2018 sum
        49039, // 2019 sum
        34338, // 2020 sum
        49623, // 2021 sum
        53475  // 2022 sum
    ];

    const data = {
        labels: yearLabels,
        datasets: [
            {
                label: 'Children Reported Missing',
                data: missingData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
                text: 'Children Missing in India Each Year'
            }
        }
    };

    return <Line data={data} options={options} />;
};

export default LineGraph;
