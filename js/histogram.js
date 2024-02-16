class Histogram {

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
        margin: _config.margin || {top: 10, right: 10, bottom: 10, left: 10},
        tooltipPadding: 10,
        legendBottom: 50,
        legendLeft: 50,
        legendRectHeight: 12, 
        legendRectWidth: 150
      }
      this.data = _data;
      // this.config = _config;
  
      this.us = _data;
  
      this.title = _title
  
      this.units = _units
  
      this.acronym = _acronym
      console.log(this.acronym)
  
      this.active = d3.select(null);
  
      this.initVis();
    }
    
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement).append('svg')
          .attr('class', 'center-container')
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
        
      vis.svg.append('rect')
              .attr('class', 'background center-container')
              .attr('height', vis.config.containerWidth ) //height + margin.top + margin.bottom)
              .attr('width', vis.config.containerHeight + 100) //width + margin.left + margin.right)
              .on('click', vis.clicked);
  
    
      vis.projection = d3.geoAlbersUsa()
              .translate([vis.width /2 , vis.height / 2])
              .scale(vis.width);
  
      vis.colorScale = d3.scaleLinear()
        .domain(d3.extent(vis.data.objects.counties.geometries, d => d.properties[this.acronym]))
          .range(['#cfe2f2', '#0d306b'])
          .interpolate(d3.interpolateHcl);
  
      vis.path = d3.geoPath()
              .projection(vis.projection);
  
      vis.g = vis.svg.append("g")
              .attr('class', 'center-container center-items us-state')
              .attr('transform', 'translate('+vis.config.margin.left+','+vis.config.margin.top+')')
              .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
              .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom)
  

  
    }
  
    
  }