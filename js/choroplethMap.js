class ChoroplethMap {

  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _title, _units, _acronym) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 0, right: 0, bottom: 50, left: 0},
      tooltipPadding: 10,
      legendBottom: 50,
      legendLeft: 50,
      legendRectHeight: 12, 
      legendRectWidth: 150
    }
    this.data = _data;
    this.ogData = this.data
    // this.config = _config;

    this.us = _data;

    this.title = _title

    this.units = _units

    this.selectedCounties = []

    this.acronym = _acronym

    this.active = d3.select(null);

    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    vis.us.objects.counties.geometries.filter(d => d.properties[this.acronym] >= 0);

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.svg.append("text")
            .attr("x", vis.width/3)
            .attr("y", vis.config.margin.top + 20)
            .attr("font-size", "20px")
            .text(this.title)

    vis.svg.append('rect')
            .attr('class', 'background center-container')
            .attr('height', vis.config.containerWidth )
            .attr('width', vis.config.containerHeight + 100)
            .on('click', vis.clicked);

  
    vis.projection = d3.geoAlbersUsa()
            .translate([vis.width /2 , vis.height / 2])
            .scale(vis.width);


    if (this.acronym == "urban") {
      vis.colorScale = d3.scaleOrdinal()
          .range(['#d3eecd', '#7bc77e', '#2a8d46', "#1b562b"]) // light green to dark green
          .domain(['Rural','Suburban','Small City', "Urban"]);
    }
    else {
      vis.colorScale = d3.scaleLinear()
        .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties[this.acronym]))
          .range(['#cfe2f2', '#0d306b'])
          .interpolate(d3.interpolateHcl);
    }

    const brushed = (event) => {
      const [[x0, y0], [x1, y1]] = event.selection;

      // Filter counties based on the brush selection
      const selected = vis.counties.filter(d => {
        const [cx, cy] = vis.path.centroid(d);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
      });

      // Clear previously selected counties
      vis.counties.classed('selected', false).style("fill", d => {
                  if (d.properties[this.acronym]) {
                    return vis.colorScale(d.properties[this.acronym]);
                  } else {
                    return 'url(#lightstripe)';
                  }})

      // Highlight selected counties
      selected.classed('selected', true).style("fill", "blue");
    }

    const brushend = (event) => {
      if (!event.selection) return;
      const [[x0, y0], [x1, y1]] = event.selection;

      // Filter counties based on the brush selection and store in the selectedCounties array
      const selected = vis.counties.filter(d => {
        const [cx, cy] = vis.path.centroid(d);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
      });

      vis.data = selected.data();

      vis.updateVis()
    }

    // Add brush
    var brush = d3
    .brush()
    .extent([[0, 0],[vis.config.containerWidth, vis.config.containerHeight]])
    .on("start brush end", brushed)
    .on("end", brushend);

    // Append brush
    vis.svg.append("g").attr("class", "brush").call(brush);

    vis.path = d3.geoPath()
            .projection(vis.projection);

    vis.g = vis.svg.append("g")
            .attr('class', 'center-container center-items us-state')
            .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)


    const resetZoom = () => {
        this.selectedCounties = [];
        vis.updateVis();

    }


    document.getElementById("remove-filter").addEventListener("click", resetZoom)
    document.getElementById("remove-filter2").addEventListener("click", resetZoom)

  }
  updateVis() {

    let vis = this;
    
    if (this.selectedCounties.length != 0) {vis.us.objects.counties.geometries = this.selectedCounties.filter(d => this.selectedCounties.includes(d))}
    else {vis.us = this.ogData}

    vis.counties = vis.g.append("g")
                .attr("id", "counties")
                .selectAll("path")
                .data(topojson.feature(vis.us, vis.us.objects.counties).features)
                .enter().append("path")
                .attr("d", vis.path)
                // .attr("class", "county-boundary")
                .attr('fill', d => {
                      if (d.properties[this.acronym]) {
                        return vis.colorScale(d.properties[this.acronym]);
                      } else {
                        return 'url(#lightstripe)';
                      }
                    });

    vis.counties
                .on('mousemove', (event, d) => {
                    const popDensity = d.properties[this.acronym] ? `<strong>${d.properties[this.acronym]}</strong> ${this.units}` : 'No data available'; 
                    d3.select('#tooltip')
                      .style('display', 'block')
                      .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                      .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                      .html(`
                        <div class="tooltip-title">${d.properties.name}</div>
                        <div>${popDensity}</div>
                      `);
                  })
                  .on('mouseleave', () => {
                    d3.select('#tooltip').style('display', 'none');
                  });


    // Add legend manually
    const legendWidth = 250;
    const legendHeight = 12;
    const legendPadding = 5;
    const legendTicks = 6;

    const legendScale = d3.scaleLinear()
        .domain(d3.extent(vis.us.objects.counties.geometries, d => d.properties[this.acronym]))
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(legendTicks)
        .tickSize(1)
        .tickFormat(d3.format("i"));

    const legend = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${vis.config.legendLeft},${vis.config.containerHeight - vis.config.legendBottom})`);

    legend.append("g")
        .attr("class", "legend-axis")
        .attr("transform", `translate(0, ${legendPadding})`)
        .call(legendAxis);

    legend.selectAll(".legend-rect")
        .data(d3.range(d3.min(vis.us.objects.counties.geometries, d => d.properties[this.acronym]), d3.max(vis.us.objects.counties.geometries, d => d.properties[this.acronym]), (d3.max(vis.us.objects.counties.geometries, d => d.properties[this.acronym]) - d3.min(vis.us.objects.counties.geometries, d => d.properties[this.acronym])) / legendWidth))
        .enter().append("rect")
        .attr("class", "legend-rect")
        .attr("x", (d, i) => i)
        .attr("y", -6)
        .attr("width", 1)
        .attr("height", legendHeight)
        .attr("fill", d => vis.colorScale(d));

    vis.g.append("path")
                .datum(topojson.mesh(vis.us, vis.us.objects.states, function(a, b) { return a !== b; }))
                .attr("id", "state-borders")
                .attr("d", vis.path);
}

  
}