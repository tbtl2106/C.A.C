'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  sensorId: number;
  date: Date;
  value: number;
}

interface ChartProps {
  data: DataPoint[];
  type: 'line' | 'bar' | 'pie';
  height?: number;
  width?: number;
  colorScale?: (d: DataPoint) => string;
}

const ChartComponent = ({ data, type, height = 600, width = 800, colorScale }: ChartProps) => { // Increased height
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([innerHeight, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const color = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.max(data, d => d.value) || 0, 0]); // Inverted to have green for low values and red for high values

    const getTextColor = (backgroundColor: string) => {
      const color = d3.color(backgroundColor);
      if (!color) return '#000';
      const { r, g, b } = color.rgb();
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 125 ? '#000' : '#fff';
    };

    if (type === 'line') {
      const line = d3.line<DataPoint>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

      // Add Y axis
      g.append('g')
        .call(d3.axisLeft(yScale));

    } else if (type === 'bar') {
      g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.date))
        .attr('y', d => yScale(d.value))
        .attr('width', innerWidth / data.length * 0.8)
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => color(d.value));

      // Add X axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

      // Add Y axis
      g.append('g')
        .call(d3.axisLeft(yScale));

    } else if (type === 'pie') {
      const margin = { top: 80, right: 160, bottom: 80, left: 80 }; // Reduced margins
      const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 1.3; // Larger pie
      const labelRadius = radius * 1.2;
  
      const g = svg.append('g')
        .attr('transform', `translate(${width/2},${height/2})`);

      const topN = 6; // Show top N values
      const threshold = 1; // Lower threshold to 1%
      const totalValue = d3.sum(data, d => d.value);
      
      // First, create frequency map
      const valueMap = data.reduce((acc, d) => {
        acc[d.value] = (acc[d.value] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Convert to array and sort by frequency
      const sortedValues = Object.entries(valueMap)
        .map(([value, count]) => ({
          value: Number(value),
          count: count,
          percentage: (count / data.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

      // Take top N values and group the rest as "Others"
      const pieData = sortedValues.slice(0, topN);
      if (sortedValues.length > topN) {
        const othersCount = sortedValues
          .slice(topN)
          .reduce((sum, item) => sum + item.count, 0);
        if (othersCount > 0) {
          pieData.push({
            value: -1, // Assign a unique number for 'Others'
            count: othersCount,
            percentage: (othersCount / data.length) * 100
          });
        }
      }

      const pie = d3.pie<{ value: number | string, count: number, percentage: number }>()
        .value(d => d.count);

      const arc = d3.arc<d3.PieArcDatum<{ value: number | string, count: number, percentage: number }>>()
        .innerRadius(0)
        .outerRadius(radius);

      // Calculate label position
      const labelArc = d3.arc<d3.PieArcDatum<{ value: number | string, count: number, percentage: number }>>()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

      const arcs = g.selectAll('arc')
        .data(pie(pieData))
        .enter()
        .append('g')
        .attr('class', 'arc'); // Remove transform as parent group is already centered

      // Add pie slices
      arcs.append('path')
        .attr('fill', d => color(typeof d.data.value === 'number' ? d.data.value : 0))
        .attr('d', arc);

      // Create labels group after pie slices to ensure they're on top
      const labelsGroup = g.append('g').attr('class', 'labels');

      // Group slices by left/right side
      const leftSlices: { d: d3.PieArcDatum<{ value: number | string, count: number, percentage: number }>, midAngle: number }[] = [];
      const rightSlices: { d: d3.PieArcDatum<{ value: number | string, count: number, percentage: number }>, midAngle: number }[] = [];
      
      arcs.each(function(d) {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        if (midAngle < Math.PI) {
          rightSlices.push({ d, midAngle });
        } else {
          leftSlices.push({ d, midAngle });
        }
      });

      // Sort by vertical position
      leftSlices.sort((a, b) => a.midAngle - b.midAngle);
      rightSlices.sort((a, b) => a.midAngle - b.midAngle);

      // Position labels with spacing
      const positionLabels = (slices: any[], isRight: boolean) => {
        const spacing = height / (slices.length + 1);
        slices.forEach((slice, i) => {
          const { d } = slice;
          const percentage = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
          
          if (percentage < 12) {
            const y = -height/2 + spacing * (i + 1);
            const x = (isRight ? 1 : -1) * (radius + 50);
            
            labelsGroup.append('polyline')
              .attr('stroke', '#666')
              .attr('fill', 'none')
              .attr('points', () => {
                const centroid = arc.centroid(d);
                const mid = [x * 0.6, y];
                return `${centroid},${mid},${x},${y}`;
              });

            labelsGroup.append('text')
              .attr('x', x)
              .attr('y', y)
              .attr('dy', '0.35em')
              .attr('text-anchor', isRight ? 'start' : 'end')
              .text(`${d.data.value} (${d.data.percentage.toFixed(1)}%)`);
          } else {
            labelsGroup.append('text')
              .attr('transform', `translate(${arc.centroid(d)})`)
              .attr('text-anchor', 'middle')
              .text(`${d.data.value} (${d.data.percentage.toFixed(1)}%)`);
          }
        });
      };

      positionLabels(leftSlices, false);
      positionLabels(rightSlices, true);

      // Add legend with adjusted positioning
      const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 20}, ${margin.top})`); // Move legend inside frame

      pieData.forEach((d, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0, ${i * 25})`); // Increased spacing between legend items

        legendRow.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('fill', color(typeof d.value === 'number' ? d.value : 0));

        legendRow.append('text')
          .attr('x', 20)
          .attr('y', 10)
          .attr('text-anchor', 'start')
          .style('font-size', '12px')
          .style('fill', 'black')
          .text(`${d.value} (${d.percentage.toFixed(1)}%)`);
      });
    }
  }, [data, type, height, width, colorScale]);

  return (
    <svg 
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
};

export default ChartComponent;