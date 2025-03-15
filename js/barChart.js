const apiUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

fetch(apiUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    const dataset = data.data
    
    const height = 400,
          width = 1000,
          padding = 40;
    
    const years = dataset.map(function(item) {
      return new Date(item[0])
    }),
          gdp = dataset.map(function(item) { return item[1] })

    const xScale = d3.scaleTime()
                     .domain([
                       d3.min(years),
                       d3.max(years)
                     ])
                     .range([padding, width]),
          
          yScale = d3.scaleLinear()
                     .domain([
                       0,
                       d3.max(gdp)
                     ])
                     .range([height, 0]),
    
          barScale = d3.scaleLinear()
                       .domain([
                         0,
                         d3.max(gdp)
                       ])
                       .range([0, height])
    
    const xAxis = d3.axisBottom(xScale),
          
          yAxis = d3.axisLeft(yScale)
    

    const svg = d3.select('#chart')
                  .append('svg')
                  .attr('width', width)
                  .attr('height', height + 30),
          
          tooltip = d3.select('#chart')
                      .append('div')
                      .attr('id', 'tooltip')
                      .style('opacity', 0)
    
    const setXAxis = svg.append('g')
                        .attr('id', 'x-axis')
                        .attr('transform', 'translate(0, ' + height + ')')
                        .call(xAxis),
          
          setYAxis = svg.append('g')
                        .attr('id', 'y-axis')
                        .attr('transform', 'translate(' + padding + ', 0)')
                        .call(yAxis)
    
    const bar = d3.select('svg')
                  .selectAll('rect')
                  .data(dataset)
                  .enter()
                  .append('rect')
                  .attr('width', width / dataset.length)
                  .attr('height', function(d) { return barScale(d[1]) })
                  .attr('x', function(d, i) { return xScale(years[i]) })
                  .attr('y', function(d) { return height - barScale(d[1]) })
                  .attr('class', 'bar')
                  .attr('data-date', function(d) { return d[0] })
                  .attr('data-gdp', function(d) { return d[1] })
                  .on('mouseover', function(event, d) {
                    const { layerX, layerY } = event
                    tooltip.transition().duration(300).style('opacity', 1)
                    tooltip
                           .attr('data-date', d[0])
                           .attr('data-gdp', d[1])
                           .style('left', layerX + 15 + 'px')
                           .style('top', layerY - 15 + 'px')
                           .html(
                            d[0] +
                              '<br>' +
                              '$' +
                              d[1].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
                              ' Billion'
                          )
                  })
                  .on('mouseout', function(event) {
                    tooltip.transition().duration(300).style('opacity', 0)
                  })
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });
