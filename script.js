const csvUrl = 'https://raw.githubusercontent.com/Vexole/ems/main/covid.csv';

function getCovidData(covidData) {
  covidData.forEach(function (d) {
    d.totalPatients = +d.totalPatients;
    d.malePatients = +d.malePatients;
    d.femalePatients = +d.femalePatients;
    d.childrenPatients = +d.childPatients;
    d.deaths = +d.deaths;
    d.recoveredPatients = +d.recoveredPatients;
  });
}

function setupD3Select(id, width, height, margin, translateX, translateY) {
  const svg = d3
    .select(id)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${translateX},${translateY})`);
  return svg;
}

document.addEventListener('DOMContentLoaded', function () {
  const chartContainers = document.querySelectorAll('.chart-container');
  const navButtons = document.querySelectorAll('nav ul li');
  let currentChartType = 'bar-chart';

  function removeChart() {
    chartContainers.forEach((container) => {
      container.innerHTML = '';
    });
  }

  function updateChart() {
    removeChart();
    chartContainers.forEach((container) => {
      container.classList.remove('active');
    });

    document.getElementById(currentChartType).classList.add('active');
    if (currentChartType === 'bar-chart') {
      updateBarChart();
    } else if (currentChartType === 'donut-chart') {
      updateDonutChart();
    } else if (currentChartType === 'scatter-plot') {
      updateScatterPlot();
    } else if (currentChartType === 'grouped-bar-chart') {
      updateGroupedBarChart();
    }
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const chartId = button.id.replace(/([A-Z])/g, '-$1').toLowerCase();
      currentChartType = chartId;
      updateChart();
    });
  });

  updateChart();
});
