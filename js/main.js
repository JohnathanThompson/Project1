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
        d.properties["air"] = +nationalHealthData[i].air_quality;
        d.properties["park"] = +nationalHealthData[i].park_access;
        d.properties["inactive"] = +nationalHealthData[i].percent_inactive;
        d.properties["smoke"] = +nationalHealthData[i].percent_smoking;
        d.properties["urban"] = +nationalHealthData[i].urban_rural_status;
        d.properties["elder"] = +nationalHealthData[i].elderly_percentage;
        d.properties["hosp"] = +nationalHealthData[i].number_of_hospitals;
        d.properties["phys"] = +nationalHealthData[i].number_of_primary_care_physicians;
        d.properties["ins"] = +nationalHealthData[i].percent_no_heath_insurance;
        d.properties["hbp"] = +nationalHealthData[i].percent_high_blood_pressure;
        d.properties["chd"] = +nationalHealthData[i].percent_coronary_heart_disease;
        d.properties["stroke"] = +nationalHealthData[i].percent_stroke;
        d.properties["chol"] = +nationalHealthData[i].percent_high_cholesterol
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
