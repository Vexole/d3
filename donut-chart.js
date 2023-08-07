document.addEventListener('DOMContentLoaded', function () {
  const csvUrl = 'https://raw.githubusercontent.com/Vexole/ems/main/covid.csv';

  d3.csv(csvUrl).then(function (covidData) {
    covidData.forEach(function (d) {
      d.totalPatients = +d.totalPatients;
      d.malePatients = +d.malePatients;
      d.femalePatients = +d.femalePatients;
      d.childrenPatients = +d.childrenPatients;
      d.deaths = +d.deaths;
      d.recoveredPatients = +d.recoveredPatients;
    });

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select('#donut-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const radius = Math.min(width, height) / 2;

    const color = d3
      .scaleOrdinal()
      .domain(['Male', 'Female', 'Children'])
      .range(['steelblue', 'orange', 'green']);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    const data = [
      { name: 'Male', value: d3.sum(covidData, (d) => d.malePatients) },
      { name: 'Female', value: d3.sum(covidData, (d) => d.femalePatients) },
      { name: 'Children', value: d3.sum(covidData, (d) => d.childPatients) },
    ];

    const path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    const arc = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arc
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => color(d.data.name))
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    function handleMouseOver(event, d) {
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
      d3.select(this).attr('fill', 'purple');
      svg
        .append('text')
        .attr('class', 'percent-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', '16px')
        .text(`${percent.toFixed(2)}%`);
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('fill', color(d.data.name));
      svg.select('.percent-label').remove();
    }

    const legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(160, ${i * 40})`);

    legend
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => color(d.name));

    legend
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .text((d) => d.name);
  });
});
