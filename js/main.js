/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0];
  const countyPopulationData = data[1];
  const nationalHealthData = data[2];

  // Combine both datasets by adding the population density to the TopoJSON file
  geoData.objects.counties.geometries.forEach(d => {
    console.log(d);  
    for (let i = 0; i < nationalHealthData.length; i++) {
      if (d.id === nationalHealthData[i].cnty_fips) {
        d.properties.pop = +nationalHealthData[i].poverty_perc;
      }

    }
  });

  const choroplethMap = new ChoroplethMap({ 
    parentElement: '.viz',   
  }, geoData);
})
.catch(error => console.error(error));
