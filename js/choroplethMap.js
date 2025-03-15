const educationApiURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
      countyApiURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([
  fetch(educationApiURL),
  fetch(countyApiURL)
])
  .then(function(responses) {
    return Promise.all(responses.map(function(response) {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }));
  })
  .then(function(data) {
    const educationData = data[0],
          countyData = data[1];
  
    const counties = topojson.feature(countyData, countyData.objects.counties);
  
    const width = 1100,
          height = 600;
  
    const colorScale = d3.scaleSequential(d3.interpolateRgbBasis(['white', 'red', 'blue']))
                         .domain([0, 100]);

    const chart = d3.select('body')
                    .append('div')
                    .attr('id', 'chart'),
          
          heading = chart.append('heading')
                         .attr('class', 'heading'),

          title = heading.append('h1')
                         .attr('id',  'title')
                         .text('United States Educational Attainment'),

          description = heading.append('h3')
                               .attr('id', 'description')
                               .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)'),

          svg = chart.append('svg')
                      .attr('width', width)
                      .attr('height', height),

          tooltip = chart.append('div')
                          .attr('id', 'tooltip')
                          .style('opacity', 0);
  
    svg.selectAll('path')
       .data(counties.features)
       .enter()
       .append('path')
       .attr('d', d3.geoPath())
       .attr('fill', function(d) {
         const percentage = educationData.find(function(item) {
           return item.fips === d.id
         })?.bachelorsOrHigher || 0;
         return colorScale(percentage);
       })
       .attr('data-fips', function (d) {
          return d.id;
       })
       .attr('data-education', function (d) {
          const percentage = educationData.find(function(item) {
            return item.fips === d.id;
          })?.bachelorsOrHigher || 0
          return percentage;
       })
       .attr('class', 'county')
       .attr('stroke', 'white')
       .attr('stroke-width', 1)
       .on('mouseover', function(event, item) {
          const { layerX, layerY } = event
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip.html(function(d) {
                    const result = educationData.find(function(e) {
                      return e.fips === item.id;
                    })
                    
                   return `${result.area_name}, ${result.state}%: ${result.bachelorsOrHigher}%`
                 })
                 .attr('data-education', function() {
                    const percentage = educationData.find(function(e) {
                      return e.fips === item.id;
                    })?.bachelorsOrHigher || 0
                    return percentage;
                 })
                 .style('left', (layerX + 5) + 'px')
                 .style('top', (layerY + 15) + 'px');
       })
       .on('mouseout', function() {
         tooltip.transition().duration(500).style('opacity', 0);
       });
  
  const legendData = [0, 20, 40, 60, 80, 100],
        legendWidth = 300,
        legendHeight = 20,
        legendX = width - 400;

  const legend = svg.append('g')
                    .attr('id', 'legend');
  
  legend.selectAll('rect')
        .data(legendData)
        .enter()
        .append('rect')
        .attr('x', function(d, i) { return legendX + i * (legendWidth / (legendData.length - 1)) })
        .attr('y', 15)
        .attr('width', legendWidth / (legendData.length - 1))
        .attr('height', legendHeight)
        .attr('fill', function(d) { return colorScale(d) })
        .attr('stroke', 'black')
        .attr('stroke-width', 0.5);
  
  legend.selectAll('text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', function(d, i) { return (legendX + i * (legendWidth / (legendData.length - 1)) + 30) })
        .attr('y', 50)
        .text(function(d) {return `${d}%`})
        .style('text-anchor', 'middle');
  
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
