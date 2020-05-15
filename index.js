let data;

const drawGraph = function (statesData, state = 'Telangana') {
  const height = 600;
  const width = 1200;

  document.querySelector('#graph').innerHTML = '';
  document.querySelector('#state-name').innerText = state;

  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('height', height + 200)
    .attr('width', width + 200);

  const data = parse(statesData, state);

  const g = svg.append('g').attr('transform', 'translate(100, 10)');

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => `${d.district} (${d.active})`))
    .range([0, width - 100])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d.active)) + 100])
    .range([height, 0]);

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(20))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -60)
    .attr('y', -60)
    .attr('stroke', 'black')
    .text('Active Cases');

  const xAxis = g
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));
  xAxis
    .selectAll('text')
    .attr('dx', '-0.8em')
    .attr('dy', '-0.0em')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-45)');
  xAxis
    .append('text')
    .attr('x', width / 2)
    .attr('y', 90)
    .attr('stroke', 'black')
    .text('Districts');

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(`${d.district} (${d.active})`))
    .attr('y', (d) => yScale(d.active))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.active));

  g.append('text')
    .attr('x', width - 100)
    .attr('y', 10)
    .attr('stroke', 'black')
    .text(
      `Total Active Cases: ${data.reduce((total, d) => total + d.active, 0)}`
    );

  g.append('text')
    .attr('x', width - 100)
    .attr('y', 30)
    .attr('stroke', 'black')
    .text(
      `Total Confirmed Cases: ${data.reduce(
        (total, d) => total + d.confirmed,
        0
      )}`
    );

  g.append('text')
    .attr('x', width - 100)
    .attr('y', 50)
    .attr('stroke', 'black')
    .text(
      `Total Deceased Cases: ${data.reduce(
        (total, d) => total + d.deceased,
        0
      )}`
    );
};

const drawSelect = function (data) {
  console.log(data);
  const select = document.querySelector('#selector');
  const options = data.map((state) => {
    let value = `"${state.state}"`;
    if (value.match(/telangana/i)) {
      value += ' selected';
    }
    return `<option value=${value}>${state.state}</option>`;
  });
  select.innerHTML = options.join('\n');
  return data;
};

const parse = (data, state = 'Telangana') => {
  console.log(data);
  const stateData = data.find((d) => d.state === state);
  return stateData.districtData;
};

const addListeners = function () {
  const select = document.querySelector('#selector');
  select.addEventListener('change', () => {
    const val = select.options[select.selectedIndex].value;
    console.log(val);
    drawGraph(data, val.trim());
  });
};

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then(drawSelect)
    .then((d) => (data = d))
    .then(drawGraph);
  setTimeout(main, 1800000);
  addListeners();
};
window.onload = main;
