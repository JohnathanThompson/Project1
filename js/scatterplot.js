class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _acronym1, _acronym2) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 700,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {top: 25, right: 60, bottom: 60, left: 100},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.ogData = this.data
    this.acronym1 = _acronym1
    this.acronym2 = _acronym2
    this.selectedData = []
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;
    vis.data.filter(d => d.properties[this.acronym1.acronym] >= 0); // Filter out numbers that are greater than or equal to zero

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize scales
    vis.colorScale = d3.scaleOrdinal()
        .range(['#d3eecd', '#7bc77e', '#2a8d46', "#1b562b"]) // light green to dark green
        .domain(['Rural','Suburban','Small City', "Urban"]);

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSize(-vis.height - 10)
        .tickPadding(10)
        .tickFormat(d => d + ` ${this.acronym1.units}`);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6)
        .tickSize(-vis.width - 10)
        .tickPadding(10)
        .tickFormat(d => d + ` ${this.acronym2.units}`);;

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement).append('svg')
        .attr('class', 'center-container')
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    const brushed = (event) => {
        if (!event.selection) return;
        const [[x0, y0], [x1, y1]] = event.selection;
        vis.circles.classed("selected", (d) => x0 - vis.config.margin.left <= vis.xScale(d.properties[this.acronym1.acronym]) 
                            && x1 - vis.config.margin.right * 2 + 20 >= vis.xScale(d.properties[this.acronym1.acronym])
                            && y0 - vis.config.margin.top <= vis.yScale(d.properties[this.acronym2.acronym]) 
                            && y1 - 25 >= vis.yScale(d.properties[this.acronym2.acronym]));
        vis.circles.filter(".selected").style("fill", "blue");
        vis.circles.filter(":not(.selected)").style("fill", d => vis.colorScale(vis.colorValue(d)));
      }

    const brushend = (event) => {
        if (!event.selection) return;
        const [[x0, y0], [x1, y1]] = event.selection;
        vis.circles.filter(".selected").style("fill", d => vis.colorValue(d));
        var selectedData = vis.data
                .filter((d) => x0 - vis.config.margin.left <= vis.xScale(d.properties[this.acronym1.acronym])
                && x1 - vis.config.margin.right * 2 + 20 >= vis.xScale(d.properties[this.acronym1.acronym])
                && y0 - vis.config.margin.top <= vis.yScale(d.properties[this.acronym2.acronym])
                && y1 - 25 >= vis.yScale(d.properties[this.acronym2.acronym]))
        vis.data = selectedData
        this.selectedData = vis.data
        vis.updateVis()}
    // Add brush
    var brush = d3
    .brush()
    .extent([[0, 0],[vis.config.containerWidth, vis.config.containerHeight]])
    .on("start brush end", brushed)
    .on("end", brushend);

    // Append brush
    vis.svg.append("g").attr("class", "brush").call(brush);
    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height + 30)
        .attr('x', vis.width)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.acronym1.title);

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text(this.acronym2.title);

    const resetZoom = () => {
        this.selectedData = [];
        vis.data = this.ogData
        vis.updateVis();
    }

    document.getElementById("scatterplot-zoom").addEventListener("click", resetZoom)

    // Specificy accessor functions
    vis.colorValue = d => d.properties.urban;
    vis.xValue = d => d.properties[this.acronym1.acronym];
    vis.yValue = d => d.properties[this.acronym2.acronym];
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;

    if (this.selectedData.length != 0) {vis.data = vis.data.filter(d => this.selectedData.includes(d))}
    
    // Set the scale input domains
    vis.xScale.domain([d3.min(vis.data, vis.xValue), d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([d3.min(vis.data, vis.yValue), d3.max(vis.data, vis.yValue)]);
    

    vis.circles = vis.chart.selectAll('.point')
        .data(vis.data.filter(d => vis.yValue(d) > 0 && vis.xValue(d) > 0), d => d.properties.name)
        .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill', d => vis.colorScale(vis.colorValue(d)));


    // Tooltip event listeners
    vis.circles
        .on('mouseover', (event,d) => {
            const popDensity1 = d.properties[this.acronym1.acronym] ? `<strong>${d.properties[this.acronym1.acronym]}</strong> ${this.acronym1.units}` : 'No data available'; 
            const popDensity2 = d.properties[this.acronym2.acronym] ? `<strong>${d.properties[this.acronym2.acronym]}</strong> ${this.acronym2.units}` : 'No data available'; 
            d3.select('#tooltip')
                .style('display', 'block')
                .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
                .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
                .html(`
                <div class="tooltip-title">${d.properties.name}</div>
                <div class="tooltip-title">${d.properties["state"]}</div>
                <div>${popDensity1}</div>
                <div>${popDensity2}</div>
                <div>${d.properties.urban}</div>
                `);
            })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
    
    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
        .call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG
        .call(vis.yAxis)
        .call(g => g.select('.domain').remove())


  
  }

}