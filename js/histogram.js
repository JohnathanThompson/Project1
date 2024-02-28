class Histogram {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _acronym1, _id) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 700,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 25, right: 60, bottom: 20, left: 100 },
      tooltipPadding: _config.tooltipPadding || 15,
    };
    this.data = _data;
    this.ogData = _data;
    this.mergedBins = [];
    this.id = _id;

    this.acronym1 = _acronym1;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
initVis() {
    let vis = this;

    // set the dimensions and margins of the graph
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Create SVG
    vis.svg = d3.select(vis.config.parentElement)
      .append('svg')
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight)
      .append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Define scales
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width])
      .domain([0, d3.max(vis.data, d => d.properties[vis.acronym1.acronym])]);

    // Y axis scale
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)

    vis.yAxis = d3.axisLeft(vis.yScale)

    // Create histogram layout
    vis.histogram = d3.histogram()
      .value(d => d.properties[vis.acronym1.acronym])
      .domain(vis.xScale.domain())
      .thresholds(vis.xScale.ticks(40));

    // Generate bins
    vis.bins = vis.histogram(vis.data);

    // Update yScale domain based on data
    vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);

    // Append X axis
    vis.svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(vis.xAxis);

    // Append Y axis
    vis.svg.append("g")
      .attr("class", "y-axis")
      .call(vis.yAxis);

    const brushed = (event) => {
      if (!event.selection) return;
      var [x0, x1] = event.selection;
      var selectedBins = vis.bins.filter(d => x0 <= vis.xScale(d.x0) && x1 >= vis.xScale(d.x1));
      var mergedBins = [];
      for (let i = 0; i < selectedBins.length; i++) {
        mergedBins = mergedBins.concat(selectedBins[i]);
      }
      vis.mergedBins = mergedBins;
      vis.bars.classed("selected", d => x0 <= vis.xScale(d.x0) && x1 >= vis.xScale(d.x1));
      vis.bars.filter(".selected").style("fill", "blue");
      vis.bars.filter(":not(.selected)").style("fill", "#69b3a2");
    }

    const brushend = (event) => {
      if (!event.selection) return;
      console.log(event.selection);
      console.log(vis.mergedBins);
    }

    // Append brush
    vis.brush = d3.brushX()
      .extent([[0, 0], [vis.width, vis.height]])
      .on("start brush", brushed)
      .on("end", brushend);

    vis.svg.append("g")
      .attr("class", "brush")
      .call(vis.brush);
    // Draw bars
    vis.bars = vis.svg.selectAll(".bar")
      .data(vis.bins)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => vis.xScale(d.x0))
      .attr("y", d => vis.yScale(d.length))
      .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
      .attr("height", d => vis.height - vis.yScale(d.length))
      .style("fill", "#69b3a2");


    // Add tooltip
    vis.bars
      .on("mousemove", (event, d) => {
        d3.select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px")
          .html(`<div class="tooltip-title">${d.length} counties</div>
                 <div>${d.x0}${vis.acronym1.units} - ${d.x1}${vis.acronym1.units}</div>`);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });

  }
  updateVis() {
    let vis = this;
  
  }

}
