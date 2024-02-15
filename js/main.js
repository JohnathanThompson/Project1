/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

Promise.all([
  d3.json('data/counties-10m.json'),
  d3.csv('data/national_health_data.csv')
]).then(data => {
  const geoData = data[0];
  const nationalHealthData = data[1];

  // Combine both datasets by adding the population density to the TopoJSON file
  geoData.objects.counties.geometries.forEach(d => {  
    for (let i = 0; i < nationalHealthData.length; i++) {
      if (d.id === nationalHealthData[i].cnty_fips) {
        d.properties["pov"] = +nationalHealthData[i].poverty_perc;
        d.properties["med"] = +nationalHealthData[i].median_household_income
        d.properties["edu"] = +nationalHealthData[i].education_less_than_high_school_percent;
      }


    }
  });

  const choroplethMap = new ChoroplethMap({ 
    parentElement: '.viz',   
  }, geoData, "Median Household Income", "median income", "med");

  const choroplethMapEducation = new ChoroplethMap({ 
    parentElement: '.viz',   
  }, geoData, "Highschool Graduation Percentage", "% graduated", "edu");
})
.catch(error => console.error(error));
