# DFS-scripts

## Summary

These scripts provide the ability to visualize the data presented in the Google Sheet.
Here is the link to example of such sheet: https://docs.google.com/spreadsheets/d/14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8/

## How to use it

### Evidence Gap Map

1) Add [res/multiselect.js](https://github.com/DFSDeveloper/DFS-scripts/blob/main/res/multiselect.js) to web page 
2) Add resources for HighCharts API to web page: 
```
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
    <script src="https://code.highcharts.com/modules/annotations.js"></script>
```
3) Add such HTML tag to web page where you want to display the visualization:
```
    <div
      id=idOfElement
      class="evidence-gap-map-visualization"
      google-sheet-id=googleSheetId
      data-table=numberOfDataTable
      data-settings-table=numberOfSettingsTable
      chart-settings-table=numberOfChartSettingsTable
      chart-scale=chartScale
      to-fix-dimensions=toFixDimentions
    ></div>
```
Where: 
```
  idOfElement - custom id of element, should be unique 
  googleSheetId - id of google sheet, you can retieve it from url of sheet: 
      googleSheetId is "14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8" for this url - https://docs.google.com/spreadsheets/d/14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8
  numberOfDataTable - order number of table with data in Google Sheet
  numberOfSettingsTable - order number of settings table in Google Sheet
  numberOfChartSettingsTable - order number of chart settings table in Google Sheet
  chartScale - amount of scaling of the visualization (from 0 to 1, e.g. 0.8)
  toFixDimentions - optional parameter for fixing background polygons due to different element dimentions in the HighCharts API
```
Example:
```
    <div
      id="evidence-gap-map-visualization-1007"
      class="evidence-gap-map-visualization"
      google-sheet-id="14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8"
      data-table="1"
      data-settings-table="3"
      chart-settings-table="4"
      chart-scale="0.8"
      to-fix-dimensions="-7"
    ></div>
```


### World Map 

1) Add [res/multiselect.js](https://github.com/DFSDeveloper/DFS-scripts/blob/main/res/multiselect.js) to web page 
2) Add resources for HighCharts API to web page: 
```
    <script src="https://code.highcharts.com/maps/highmaps.js"></script>
    <script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/mapdata/custom/world-eckert3.js"></script>
```
3) Add such HTML tag to web page where you want to display the visualization:
```
    <div
      id=idOfElement
      class="world-map-visualization"
      google-sheet-id=googleSheetId
      data-table=numberOfDataTable
      data-settings-table=numberOfSettingsTable
    ></div>
```
Where: 
```
  idOfElement - custom id of element, should be unique 
  googleSheetId - id of google sheet, you can retieve it from url of sheet: 
      googleSheetId is "14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8" for this url - https://docs.google.com/spreadsheets/d/14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8
  numberOfDataTable - order number of table with data in Google Sheet
  numberOfSettingsTable - order number of settings table in Google Sheet
```

Example:
```
  <div id="world-map-visualization-0717"
    class="world-map-visualization"
    google-sheet-id="14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8"
    data-table = "1"
    data-settings-table = "2"></div>
```

If you want to add both visualizations on the same web page, add the world map HighCharts resources first, and then the evidence gap map HighCharts resources.
```
    <script src="https://code.highcharts.com/maps/highmaps.js"></script>
    <script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/mapdata/custom/world-eckert3.js"></script>
    <script src="https://code.highcharts.com/maps/highmaps.js"></script>
    <script src="https://code.highcharts.com/maps/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/mapdata/custom/world-eckert3.js"></script>

```

