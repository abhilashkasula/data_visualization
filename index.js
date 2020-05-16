let data;

const drawGraph = function (statesData, state = 'Telangana') {
  const height = 600;
  const width = 1200;

  document.querySelector('#graph').innerHTML = '';
  document.querySelector('#state-name').innerText = state;

  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('viewBox', `0 0 ${width + 200} ${height + 200}`);

  const data = parse(statesData, state);

  const g = svg.append('g').attr('transform', 'translate(100, 10)');

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.district))
    .range([0, width - 100])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d.active)) + 50])
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

  g.selectAll('.x-line')
    .data(yScale.ticks(20))
    .enter()
    .append('line')
    .attr('class', 'line x-line')
    .attr('x1', 0)
    .attr('y1', (d) => yScale(d))
    .attr('x2', width - 100)
    .attr('y2', (d) => yScale(d));

  g.selectAll('.y-line')
    .data(data)
    .enter()
    .append('line')
    .attr('class', 'line y-line')
    .attr('x1', (d) => xScale(d.district) + xScale.bandwidth() / 2)
    .attr('y1', 0)
    .attr('x2', (d) => xScale(d.district) + xScale.bandwidth() / 2)
    .attr('y2', height);

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.district))
    .attr('y', (d) => yScale(d.active))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.active));

  g.selectAll('.value')
    .data(data)
    .enter()
    .append('text')
    .text((d) => d.active)
    .attr('text-anchor', 'middle')
    .attr('x', (d) => xScale(d.district) + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(d.active) - 2)
    .attr('font-size', 12)
    .attr('fill', 'currentColor')
    .attr('font-weight', 100)
    .attr('font-family', 'sans-serif');

  const texts = [
    'Total Active Cases',
    'Total Confirmed Cases',
    'Total Deceased Cases',
    'Total Recovered Cases',
  ];

  const values = data.reduce(
    (val, d) => {
      val[0] += d.active;
      val[1] += d.confirmed;
      val[2] += d.deceased;
      val[3] += d.recovered;
      return val;
    },
    [0, 0, 0, 0]
  );

  g.append('g')
    .attr('transform', 'translate(0, 10)')
    .selectAll('.info')
    .data(texts)
    .enter()
    .append('text')
    .attr('x', width - 95)
    .attr('y', (d, i) => i * 20 + 10)
    .attr('stroke', 'black')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '0.8em')
    .text((d, i) => `${d}: ${values[i]}`);
};

const drawSelect = function (data) {
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
  const stateData = data.find((d) => d.state === state);
  return stateData.districtData;
};

const addListeners = function () {
  const select = document.querySelector('#selector');
  select.addEventListener('change', () => {
    const val = select.options[select.selectedIndex].value;
    drawGraph(data, val.trim());
  });
};

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json')
    .then((res) => res.json())
    .then(drawSelect)
    .then((d) => (data = d))
    .then(drawGraph);
  setTimeout(main, 1800000);
  addListeners();
};
window.onload = main;
