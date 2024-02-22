class Histogram {

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
      margin: _config.margin || {top: 25, right: 60, bottom: 20, left: 100},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;

    this.acronym1 = _acronym1
    this.acronym2 = _acronym2
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


    // append the svg object to the body of the page
    vis.svg = d3.select(vis.config.parentElement)
      .append("svg")
        .attr("width", vis.width + vis.config.margin.left + vis.config.margin.right)
        .attr("height", vis.height + vis.config.margin.top + vis.config.margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + vis.config.margin.left + "," + vis.config.margin.top + ")");

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, d3.max(vis.data, d => d.properties[this.acronym1.acronym])])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, vis.width]);
    vis.chart = vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(d3.axisBottom(x));

    // Append both axis titles
    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', 100)
        .attr('x', 100)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.acronym1.title);

    // Y axis: initialization
    var y = d3.scaleLinear()
        .range([vis.height, 0]);
    var yAxis = vis.svg.append("g")

    this.data = this.data.filter(function( element ) {
      return element !== undefined;
    });
  // A function that builds the graph for a specific value of bin
    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(d => d.properties[this.acronym1.acronym])   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(40)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(this.data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([vis.height, 0]);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    vis.svg.append("g")
        .call(d3.axisLeft(y));

    // Join the rect with the bins data

    vis.rectangles = vis.svg.selectAll("rect")
        .data(bins)
        .join("rect") // Add a new rect for each new elements // get the already existing elements as well
          .attr("x", 1)
          .attr("transform", d => "translate(" + x(d.x0) + "," + y(d.length) + ")")
          .attr("width", d => x(d.x1) - x(d.x0) )
          .attr("height", d => vis.height - y(d.length))
          .style("fill", "#69b3a2")



  }
};