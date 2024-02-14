/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/population.csv')
]).then(data => {
  const geoData = data[0];
  const countyPopulationData = data[1];

  // Combine both datasets by adding the population density to the TopoJSON file
  console.log(geoData);
  geoData.objects.counties.geometries.forEach(d => {
    console.log(d);  
    for (let i = 0; i < countyPopulationData.length; i++) {
      if (d.id === countyPopulationData[i].cnty_fips) {
        d.properties.pop = +countyPopulationData[i].Value;
      }

    }
  });

  const choroplethMap = new ChoroplethMap({ 
    parentElement: '.viz',   
  }, geoData);
})
.catch(error => console.error(error));
