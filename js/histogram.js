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
    this.mergedBins = []
    this.id = _id;

    this.acronym1 = _acronym1
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // set the dimensions and margins of the graph
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Append the svg object to the parent element
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("id", vis.id)
      .append("svg")
      .attr(
        "width",
        vis.width + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.height + vis.config.margin.top + vis.config.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        "translate(" +
          vis.config.margin.left +
          "," +
          vis.config.margin.top +
          ")"
      );

    // X axis scale
    var x = d3
      .scaleLinear()
      .domain([0, d3.max(vis.data, (d) => d.properties[this.acronym1.acronym])])
      .range([0, vis.width]);

    // Append X axis
    vis.svg
      .append("g")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(d3.axisBottom(x));

    // Y axis scale
    var y = d3.scaleLinear().range([vis.height, 0]);

    // Filter out undefined elements from data
    this.data = this.data.filter(function (element) {
      return element !== undefined;
    });

    // Create histogram layout
    var histogram = d3
      .histogram()
      .value((d) => d.properties[this.acronym1.acronym])
      .domain(x.domain())
      .thresholds(x.ticks(40));

    // Generate bins
    var bins = histogram(this.data);

    // Y axis: scale and draw:
    var y = d3.scaleLinear().range([vis.height, 0]);
    y.domain([
      0,
      d3.max(bins, function (d) {
        return d.length;
      }),
    ]); // d3.hist has to be called before the Y axis obviously
    vis.svg.append("g").call(d3.axisLeft(y));

    // Join the rect with the bins data
    vis.rectangles = vis.svg
      .selectAll("rect")
      .data(bins)
      .join("rect") // Add a new rect for each new elements // get the already existing elements as well
      .attr("x", 1)
      .attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")")
      .attr("width", (d) => x(d.x1) - x(d.x0))
      .attr("height", (d) => vis.height - y(d.length))
      .style("fill", "#69b3a2");

    const brushed = (event) => {
      if (!event.selection) return;
      var [x0, x1] = event.selection;
      var selectedBins = bins.filter((d) => x0 <= x(d.x0) && x1 >= x(d.x1));
      var mergedBins = []
      for (let i = 0; i < selectedBins.length; i++) {
        mergedBins = mergedBins.concat(selectedBins[i])}
      this.mergedBins = mergedBins
      vis.rectangles.classed("selected", (d) => x0 <= x(d.x0) && x1 >= x(d.x1));
      vis.rectangles.filter(".selected").style("fill", "blue");
      vis.rectangles.filter(":not(.selected)").style("fill", "#69b3a2");
    }

    const brushend = (event) => {
      if (!event.selection) return;
      console.log(event.selection)
    }

    // Add brush
    var brush = d3
      .brushX()
      .extent([[0, 0],[vis.width, vis.height]])
      .on("start brush", brushed)
      .on("end", brushend);

    // Append brush
    vis.svg.append("g").attr("class", "brush").call(brush);


    // Add tooltip
    vis.rectangles
      .on("mousemove", (event, d) => {
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                      <div class="tooltip-title">${d.length} counties</div>
                      <div>${d.x0}${this.acronym1.units} - ${d.x1}${this.acronym1.units}</div>
                    `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      });

    const filterMap = () => {
        var element = document.getElementById("filter_hi");
        console.log(element)
        element.setAttribute("style", "");
        console.log(this.mergedBins)
        if (this.mergedBins) {
          const newHistogram = new Histogram(
            { parentElement: ".viz" },
            this.mergedBins,
            this.acronym1,
            "test"
          );
        }
      }
    const removeFilter = () => {d3.select("#test").remove();}
    document.getElementById("filter").addEventListener("click", filterMap);
    document.getElementById("remove-filter").addEventListener("click", removeFilter);


  }
}
