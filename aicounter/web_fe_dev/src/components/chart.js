import React from "react"
import 'chart.js/auto';
import { Chart } from 'react-chartjs-2';

const label_template_line = 'year'
const value_template_line = 'count'
const data_template_line = [
    { year: 2010, count: 10, duration: Math.round(Math.random() * 10) },
    { year: 2011, count: 20, duration: Math.round(Math.random() * 10) },
    { year: 2012, count: 15, duration: Math.round(Math.random() * 10) },
    { year: 2013, count: 25, duration: Math.round(Math.random() * 10) },
    { year: 2014, count: 22, duration: Math.round(Math.random() * 10) },
    { year: 2015, count: 30, duration: Math.round(Math.random() * 10) },
    { year: 2016, count: 28, duration: Math.round(Math.random() * 10) },
]

export function LineChart({ data = data_template_line, data_label = label_template_line, data_value = value_template_line }) {
    return (
        <>
            <BasicChart type="line" data={data} data_label={data_label} data_value={data_value} />
        </>
    )
}

export function DonutChart({ data = data_template_line, data_label = label_template_line, data_value = value_template_line }) {
    return (
        <>
            <BasicChart type="doughnut" data={data} data_label={data_label} data_value={data_value} />
        </>
    )
}

export function PieChart({ data = data_template_line, data_label = label_template_line, data_value = value_template_line }) {
    return (
        <>
            <BasicChart type="pie" data={data} data_label={data_label} data_value={data_value} />
        </>
    )
}

export function BasicChart({ type = 'line', data = data_template_line, data_label = label_template_line, data_value = value_template_line }) {
    return (
        <>
            <Chart type={type} data={{
                labels: data.map(dt => dt[data_label]),
                datasets: [
                    {
                        data: data.map(dt => dt[data_value]),
                    }
                ]
            }} options={{
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }} />
        </>
    )
}

export function MultiDataChart({ type = 'line', data = data_template_line, data_label = label_template_line, data_values = ['count', 'duration'] }) {
    return (
        <>
            <Chart type={type} data={{
                labels: data.map(dt => dt[data_label]),
                datasets: 
                    data_values.map(dt => {
                        return {
                            data: data.map(d => d[dt]),
                            label: dt.replace('_', ' '),
                            pointStyle: false
                        }
                    })
            }} options={{
                animation: false,
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }} />
        </>
    )
}