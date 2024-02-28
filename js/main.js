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
          d.properties["urban"] = nationalHealthData[i].urban_rural_status;
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

  const health_data_dict = {
      "poverty_perc": {
        acronym: "pov",
        units: "%",
        title: "Poverty Percentage",
      },
      "median_household_income": {
        acronym: "med",
        units: "Median",
        title: "Median Income"},
      "education_less_than_high_school_percent": {
        acronym: "edu",
        units: "%",
        title: "% of People who did not Graduate High School"},
      "air_quality": {
        acronym: "air",
        units: "",
        title: "Air Quality"},
      "park_access": {
        acronym: "park",
        units: "",
        title: "Park Access"},
      "percent_inactive": {
        acronym: "inactive",
        units: "%",
        title: "Percentage of People Inactive"},
      "percent_smoking": {
        acronym: "smoke",
        units: "%",
        title: "% of Smokers"},
      "urban_rural_status": {
        acronym: "urban",
        units: "",
        title: "Urban or Rural"},
      "elderly_percentage": {
        acronym: "elder",
        units: "%",
        title: "Elderly Percentage"},
      "number_of_hospitals": {
        acronym: "hosp",
        units: "hospitals",
        title: "Number of Hospitals"},
      "number_of_primary_care_physicians": {
        acronym: "phys",
        units: "physicians",
        title: "Number of primary care physicians"},
      "percent_no_heath_insurance": {
        acronym: "ins",
        units: "%",
        title: "% of People with no Health Insurance"},
      "percent_high_blood_pressure": {
        acronym: "hbp",
        units: "%",
        title: "% of People with high blood pressure"},
      "percent_coronary_heart_disease": {
        acronym: "chd",
        units: "%",
        title: "% of People with Coronary Heart Disease"},
      "percent_stroke": {
        acronym: "stroke",
        units: "%",
        title: "% of People Who Had a Stroke"},
      "percent_high_cholesterol": {
        acronym: "chol",
        units: "%",
        title: "% of People with High Cholestoral",
      },
    };

    const createMap = () => {
      d3.selectAll("svg").remove();

      var attribute1 = document.getElementById("attribute1");
      var attribute1_value = attribute1.value;
      console.log(attribute1_value)

      var attribute2 = document.getElementById("attribute2");
      var attribute2_value = attribute2.value;
      console.log(attribute2_value)

      var element = document.getElementById("graphs");
      element.setAttribute("style", "");
      
      document.getElementById("scatterplot-title").innerText =  `${health_data_dict[attribute1_value].title} vs ${health_data_dict[attribute2_value].title}`
      scatterplot = new Scatterplot(
        { parentElement: ".viz_sc" },
        geoData.objects.counties.geometries,
        health_data_dict[attribute1_value],
        health_data_dict[attribute2_value]
      );
      scatterplot.updateVis();

      const histogram = new Histogram(
        { parentElement: ".viz_hi" },
        geoData.objects.counties.geometries,
        health_data_dict[attribute1_value],
        "parent"
      );

      const histogram2 = new Histogram(
        { parentElement: ".viz_hi2" },
        geoData.objects.counties.geometries,
        health_data_dict[attribute2_value],
        "parent"
      );

      const choroplethMap1 = new ChoroplethMap(
        {
          parentElement: ".viz_cl",
        },
        geoData,
        health_data_dict[attribute1_value].title,
        health_data_dict[attribute1_value].units,
        health_data_dict[attribute1_value].acronym
      );
      choroplethMap1.updateVis();

      const choroplethMap2 = new ChoroplethMap(
        {
          parentElement: ".viz_cl2",
        },
        geoData,
        health_data_dict[attribute2_value].title,
        health_data_dict[attribute2_value].units,
        health_data_dict[attribute2_value].acronym
      );
      choroplethMap2.updateVis();
    };

    document.getElementById("button").addEventListener("click", createMap);

    d3.selectAll(".legend-btn").on("click", function () {
      // Toggle 'inactive' class
      d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));

      // Check which categories are active
      let selectedStatus = [];
      d3.selectAll('.legend-btn:not(.inactive)').each(function() {
        selectedStatus.push(d3.select(this).attr('urban-status'));
      });
      console.log(selectedStatus)

      // Filter data accordingly and update vis
      scatterplot.data = geoData.objects.counties.geometries.filter(d => selectedStatus.includes(d.properties["urban"]));
      scatterplot.updateVis();
    });
}


)
  .catch(error => console.error(error));
