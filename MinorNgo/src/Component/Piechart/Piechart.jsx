import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const Piechart = () => {

    const yearOptions = ['2018', '2019', '2020', '2021', '2022'];
    const [selectedYear, setSelectedYear] = useState('2018');

    const missingChildrenData = {
        '2018': {
            'Andhra Pradesh': 2436,
            'Bihar': 6950,
            'Delhi': 6541,
            'Madhya Pradesh': 10038,
            'Maharashtra': 1711,
            'Tamil Nadu': 4271,
            'Uttar Pradesh': 3306,
            'West Bengal': 8205
        },
        '2019': {
            'Andhra Pradesh': 2746,
            'Bihar': 7299,
            'Delhi': 6355,
            'Madhya Pradesh': 11022,
            'Maharashtra': 4562,
            'Tamil Nadu': 4519,
            'Uttar Pradesh': 3184,
            'West Bengal': 8952
        },
        '2020': {
            'Andhra Pradesh': 2745,
            'Bihar': 4868,
            'Delhi': 4299,
            'Madhya Pradesh': 8751,
            'Maharashtra': 3356,
            'Tamil Nadu': 4591,
            'Uttar Pradesh': 2380,
            'West Bengal': 7648
        },
        '2021': {
            'Andhra Pradesh': 3720,
            'Bihar': 4578,
            'Delhi': 5772,
            'Madhya Pradesh': 11607,
            'Maharashtra': 4129,
            'Tamil Nadu': 6399,
            'Uttar Pradesh': 3522,
            'West Bengal': 9996
        },
        '2022': {
            'Andhra Pradesh': 4046,
            'Bihar': 6000,
            'Delhi': 6150,
            'Madhya Pradesh': 11352,
            'Maharashtra': 3069,
            'Tamil Nadu': 7009,
            'Uttar Pradesh': 3394,
            'West Bengal': 12455
        }
    };

    const currentData = missingChildrenData[selectedYear];

    const data = {
        labels: Object.keys(currentData),
        datasets: [
            {
                data: Object.values(currentData),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56',
                    '#4BC0C0', '#9966FF', '#FF9F40',
                    '#C9CBCF', '#E7E9ED'
                ]
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right'
            },
            title: {
                display: true,
                text: `Statewise Missing Children - ${selectedYear}`
            }
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '10px' }}>
                <label>Select Year: </label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {yearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            <Pie data={data} options={options} />
        </div>
    );
};

export default Piechart;
