/* An example of html tag
    <div
    id="evidence-gap-map-visualization-1007"
    class="evidence-gap-map-visualization"
    google-sheet-id="14xd4jJ8Qukl7dyp0vGJ5k8qxMUgHIuMGxGrIspm2zx8"
    data-table="1"
    data-settings-table="3"
    chart-settings-table="4"
    chart-scale="0.8"
    to-fix-dimensions="-7"
  ></div> */

const evidenceGapMapVisualizationClass = "evidence-gap-map-visualization";

//Collect all elements, where evidence gap map is needed
let evidenceGapMapElementsArray = document.querySelectorAll(
  "." + evidenceGapMapVisualizationClass
);

const evidenceGapMapValueSeparator = "|"; //Separator is used to separate values in cells of sheet
const typeOfBubble1 = "depend on outcomes"; // Type of evidence gap visualization
const typeOfBubble2 = "depend on article";

//Applying logic for every evidence gap map element
evidenceGapMapElementsArray.forEach((evidenceGapMapElement) => {
  const googleSheetId =
    evidenceGapMapElement.attributes["google-sheet-id"].value;
  const mainComponentId = evidenceGapMapElement.attributes.id.value;
  const chartContainerId = mainComponentId + "-chart-container";
  const chartId = mainComponentId + "-chart";
  const filterWrapperBlockId = mainComponentId + "-filter-wrapper-block";
  const updateButtonId = mainComponentId + "-update-visualization-btn";
  const studyListHeaderId = mainComponentId + "-study-list-header";
  const studyListItemWrapperId = mainComponentId + "-study-list-item-wrapper";
  const filterSelectClass = mainComponentId + "-visualization-filter-select";

  const numberOfDataTableInGoogleSheet =
    +evidenceGapMapElement.attributes["data-table"].value || 1;
  const numberOfSettingsTableInGoogleSheet =
    +evidenceGapMapElement.attributes["data-settings-table"].value || 3;
  const numberOfChartSettingsTableInGoogleSheet =
    +evidenceGapMapElement.attributes["chart-settings-table"].value || 4;
  const chartScale =
    +evidenceGapMapElement.attributes["chart-scale"].value || 0.8;
  const toFixDimensions =
    +evidenceGapMapElement.attributes["to-fix-dimensions"].value || 0; //due to different dimensions of grid and background polygons in visualization

  //Get data from google sheet
  getGoogleSheetForEvidenceMap(
    googleSheetId,
    numberOfDataTableInGoogleSheet,
    numberOfSettingsTableInGoogleSheet,
    numberOfChartSettingsTableInGoogleSheet
  ).then((data) => {
    //Create a component to which the remaining elements will be added
    createInitialComponentForEvidenceMap(
      mainComponentId,
      chartContainerId,
      chartId,
      studyListHeaderId,
      studyListItemWrapperId
    );

    //Initialize all variables for the visualization
    const typeOfBubbles = data.settings.typeOfBubbles || typeOfBubble1;
    let settings = getSettingsObjectForEvidenceMap(data.settings);
    let chartSettings = getChartSettingsObjectForEvidenceMap(
      data.chartSettings
    );

    let chartElement = document.getElementById(chartId);
    let chartContainerElement = document.getElementById(chartContainerId);

    let labelsArrayX = chartSettings.outcomesCategories.map(
      (category) => category.title
    );
    let labelsArrayY = chartSettings.interventionsCategories.map(
      (category) => category.title
    );
    let plotLinesX = [];
    let plotLinesY = [];

    let totalRowName = "";
    let totalRowBackgroundColor = "";
    if (typeOfBubbles == typeOfBubble1) {
      totalRowName = chartSettings.totalRowName || "Total";
      totalRowBackgroundColor = chartSettings.totalRowBackgroundColor || "gray";
      labelsArrayY.push(totalRowName);
    }
    let filtersBlockArray = settings.filtersBlockArray;

    // Variables for chart
    const columnCount = labelsArrayX.length;
    const rowCount = labelsArrayY.length;
    const columnCategoryLabelHeight = 80;
    const rowCategoryLabelWidth = 80;
    const labelColumnsHeight = 250 + columnCategoryLabelHeight;
    const labelRowWidth = 300 + rowCategoryLabelWidth;
    const chartWidth = 2200;
    const chartHeight = 2500;
    const cellWidth = Math.round((chartWidth - labelRowWidth) / columnCount);
    const cellHeight = Math.round(
      (chartHeight - labelColumnsHeight) / rowCount
    );

    chartElement.style.height = chartHeight + "px";
    chartElement.style.width = chartWidth + "px";
    chartElement.style.transform = "scale(" + chartScale + ")";
    chartElement.style.transformOrigin = "top left";
    chartContainerElement.style.height =
      chartHeight * (chartScale + 0.01) + "px";
    // chartContainerElement.style.width = chartWidth * chartScale + "px";
    chartContainerElement.style.width = "100%";

    //Prepare data structure for highchart
    let initialDataForChart = settings.bubbles;

    //Prepare an array of studies
    let arrayOfStudies = getStudiesArrayForEvidenceMap(data.sheet, settings);

    //Prepare initial structure for filters data
    filtersValuesToFilter = initializeStudiesValuesArrayForEvidenceMap(
      filtersBlockArray
    );

    //Transform data in suitable for highcharts format
    let dataForChart = getDataForChartForEvidenceMap(
      typeOfBubbles,
      arrayOfStudies,
      labelsArrayX,
      labelsArrayY,
      cellWidth,
      labelRowWidth,
      chartHeight,
      cellHeight,
      labelColumnsHeight,
      initialDataForChart,
      totalRowName
    );

    //Creating grid and catigories for highchart
    // need to create a grid strictly BEFORE chart initialization
    prepareGridAndCategoriesForEvidenceMap(
      mainComponentId,
      chartSettings,
      labelsArrayX,
      labelsArrayY,
      plotLinesX,
      plotLinesY,
      chartHeight,
      columnCount,
      rowCount,
      cellWidth,
      cellHeight,
      labelRowWidth,
      rowCategoryLabelWidth,
      labelColumnsHeight,
      totalRowName,
      toFixDimensions
    );

    //Add background polygons
    let additionalItemsForChart = addBackgroundsForHighchartForEvidenceMap(
      chartSettings,
      chartWidth,
      chartHeight,
      cellWidth,
      cellHeight,
      labelRowWidth,
      labelColumnsHeight,
      totalRowName,
      totalRowBackgroundColor,
      toFixDimensions
    );

    //Create chart
    let chart = getAndCreateChartForEvidenceMap(
      chartId,
      chartWidth,
      chartHeight,
      plotLinesX,
      plotLinesY,
      dataForChart,
      additionalItemsForChart,
      studyListHeaderId,
      studyListItemWrapperId
    );

    //reinitialize filters data
    let filtersValuesFromSheetArray = getArrayOfFiltersValueForEvidenceMap(
      arrayOfStudies,
      filtersBlockArray
    );

    //Add filters to page
    createFiltersBlockComponentForEvidenceMap(
      mainComponentId,
      filterWrapperBlockId,
      updateButtonId,
      filterSelectClass,
      filtersBlockArray,
      filtersValuesFromSheetArray
    );

    //Set up all updating logic in this function
    addUpdateBtnHandlerForEvidenceMap(
      typeOfBubbles,
      chart,
      arrayOfStudies,
      additionalItemsForChart,
      filtersBlockArray,
      filterSelectClass,
      chartId,
      updateButtonId,
      studyListHeaderId,
      studyListItemWrapperId,
      labelsArrayX,
      labelsArrayY,
      plotLinesX,
      plotLinesY,
      cellWidth,
      labelRowWidth,
      rowCategoryLabelWidth,
      chartHeight,
      chartWidth,
      cellHeight,
      labelColumnsHeight,
      initialDataForChart,
      totalRowName,
      totalRowBackgroundColor
    );
  });
});

function createInitialComponentForEvidenceMap(
  mainComponentId,
  chartContainerId,
  chartId,
  studyListHeaderId,
  studyListItemWrapperId
) {
  let mainComponentElement = document.getElementById(mainComponentId);

  let chartContainerElement = document.createElement("div");
  chartContainerElement.id = chartContainerId;
  chartContainerElement.setAttribute(
    "style",
    "overflow: hidden; overflow-x: scroll; width: 100%;"
  );
  mainComponentElement.append(chartContainerElement);

  let chartElement = document.createElement("div");
  chartElement.id = chartId;
  chartElement.setAttribute("style", "margin: auto;");
  chartContainerElement.append(chartElement);

  let studyListContainerElement = document.createElement("div");
  studyListContainerElement.classList.add("study-list-container");
  mainComponentElement.append(studyListContainerElement);

  let studyListHeaderElement = document.createElement("div");
  studyListHeaderElement.id = studyListHeaderId;
  studyListContainerElement.append(studyListHeaderElement);

  let studyListItemWrapperElement = document.createElement("div");
  studyListItemWrapperElement.id = studyListItemWrapperId;
  studyListContainerElement.append(studyListItemWrapperElement);
}

function addBackgroundsForHighchartForEvidenceMap(
  chartSettings,
  chartWidth,
  chartHeight,
  cellWidth,
  cellHeight,
  labelRowWidth,
  labelColumnsHeight,
  totalRowName,
  totalRowBackgroundColor,
  toFixDimensions
) {
  let resultArray = [];

  //add outcome backgrounds
  chartSettings.outcomesCategories.forEach((category, index, array) => {
    if (category.color) {
      coord1 = [labelRowWidth + cellWidth * index, chartHeight];
      coord2 = [labelRowWidth + cellWidth * index + cellWidth, chartHeight];
      coord3 = [
        labelRowWidth + cellWidth * index + cellWidth,
        chartHeight - labelColumnsHeight,
      ];
      coord4 = [
        labelRowWidth + cellWidth * index,
        chartHeight - labelColumnsHeight,
      ];

      let polygonItem = {
        name: "Polygon",
        type: "polygon",
        color: category.color,
        states: {
          inactive: {
            opacity: 1,
          },
        },
        showInLegend: false,
        enableMouseTracking: false,
        data: [coord1, coord2, coord3, coord4],
      };
      resultArray.push(polygonItem);
    }
  });

  // add intervention backgrounds
  chartSettings.interventionsCategories.forEach((category, index, array) => {
    if (category.color) {
      coord1 = [0, chartHeight - labelColumnsHeight - cellHeight * index];
      coord2 = [
        labelRowWidth,
        chartHeight - labelColumnsHeight - cellHeight * index,
      ];
      coord3 = [
        labelRowWidth,
        chartHeight - labelColumnsHeight - cellHeight * (index + 1),
      ];
      coord4 = [0, chartHeight - labelColumnsHeight - cellHeight * (index + 1)];

      let polygonItem = {
        name: "Polygon",
        type: "polygon",
        color: category.color,
        states: {
          inactive: {
            opacity: 1,
          },
        },
        showInLegend: false,
        enableMouseTracking: false,
        data: [coord1, coord2, coord3, coord4],
      };
      resultArray.push(polygonItem);
    }
  });

  // add total background
  if (totalRowName && totalRowBackgroundColor) {
    coord1 = [
      0,
      chartHeight -
        labelColumnsHeight -
        cellHeight * chartSettings.interventionsCategories.length,
    ];
    coord2 = [
      labelRowWidth,
      chartHeight -
        labelColumnsHeight -
        cellHeight * chartSettings.interventionsCategories.length,
    ];
    coord3 = [
      labelRowWidth,
      chartHeight -
        labelColumnsHeight -
        cellHeight * (chartSettings.interventionsCategories.length + 1) +
        toFixDimensions,
    ];
    coord4 = [
      0,
      chartHeight -
        labelColumnsHeight -
        cellHeight * (chartSettings.interventionsCategories.length + 1) +
        toFixDimensions,
    ];

    let polygonItem = {
      name: "Polygon",
      type: "polygon",
      color: totalRowBackgroundColor,
      states: {
        inactive: {
          opacity: 1,
        },
      },
      showInLegend: false,
      enableMouseTracking: false,
      data: [coord1, coord2, coord3, coord4],
    };
    resultArray.push(polygonItem);
  }

  return resultArray;
}

function getValuesFromFilterBlockForEvidenceMap(
  filtersBlockArray,
  filterSelectClass
) {
  let resultArray = initializeStudiesValuesArrayForEvidenceMap(
    filtersBlockArray
  );
  let filterList = document.querySelectorAll(`.${filterSelectClass}`);

  filterList.forEach((filterNode) => {
    document
      .querySelectorAll(`#${filterNode.id}_itemList ul li`)
      .forEach(function (item) {
        resultArray.forEach((filtersValuesItem) => {
          if (item.classList.contains("active")) {
            if (filterNode.name == filtersValuesItem.title) {
              filtersValuesItem.values.push(
                item
                  .querySelector(".multiselect-checkbox")
                  .getAttribute("data-val")
              );
            }
          }
        });
      });
  });

  return resultArray;
}

function getArrayOfFiltersValueForEvidenceMap(studiesArray, filtersBlockArray) {
  let filtersValuesFromSheetArray = initializeStudiesValuesArrayForEvidenceMap(
    filtersBlockArray
  );

  // Create array with all filters values
  studiesArray.forEach((study, index, array) => {
    study.filterBlock.forEach((studyFilterItem, indexOfblockFilter) => {
      studyFilterItem.values.forEach((studyFilterItemValue) => {
        filtersValuesFromSheetArray.forEach((filterArrayTemp) => {
          if (filterArrayTemp.title == studyFilterItem.title) {
            if (filterArrayTemp.values.indexOf(studyFilterItemValue) === -1) {
              filterArrayTemp.values.push(studyFilterItemValue.trim());
            }
          }
        });
      });
    });
  });

  return filtersValuesFromSheetArray;
}

function addUpdateBtnHandlerForEvidenceMap(
  typeOfBubbles,
  chart,
  arrayOfStudies,
  additionalItemsForChart,
  filtersBlockArray,
  filterSelectClass,
  chartId,
  updateButtonId,
  studyListHeaderId,
  studyListItemWrapperId,
  labelsArrayX,
  labelsArrayY,
  plotLinesX,
  plotLinesY,
  cellWidth,
  labelRowWidth,
  rowCategoryLabelWidth,
  chartHeight,
  chartWidth,
  cellHeight,
  labelColumnsHeight,
  initialDataForChart,
  totalRowName,
  totalRowBackgroundColor
) {
  document
    .getElementById(updateButtonId)
    .addEventListener("click", async function (event) {
      let studyListHeaderElement = document.getElementById(studyListHeaderId);
      let studyListElement = document.getElementById(studyListItemWrapperId);
      studyListHeaderElement.innerHTML = "";
      studyListElement.innerHTML = "";

      filtersValuesFromFilterBlockArray = getValuesFromFilterBlockForEvidenceMap(
        filtersBlockArray,
        filterSelectClass
      );

      let filteredStudiesArray = getFilteredStudiesArrayForEvidenceMap(
        arrayOfStudies,
        filtersValuesFromFilterBlockArray
      );

      let dataForChartForFiltration = getDataForChartForEvidenceMap(
        typeOfBubbles,
        filteredStudiesArray,
        labelsArrayX,
        labelsArrayY,
        cellWidth,
        labelRowWidth,
        chartHeight,
        cellHeight,
        labelColumnsHeight,
        initialDataForChart,
        totalRowName,
        totalRowBackgroundColor
      );

      let chart = getAndCreateChartForEvidenceMap(
        chartId,
        chartWidth,
        chartHeight,
        plotLinesX,
        plotLinesY,
        dataForChartForFiltration,
        additionalItemsForChart,
        studyListHeaderId,
        studyListItemWrapperId
      );

      dataForChartForFiltration = [];
      filtersValuesFromFilterBlockArray = initializeStudiesValuesArrayForEvidenceMap(
        filtersBlockArray
      );
    });
}

function getTitleAsHTML(title, link) {
  if (typeof link === "string" && link.length > 0) {
    return `<a href="${link}" target="_blank"> ${title} </a>`;
  } else {
    return title;
  }
}

function getDataForChartForEvidenceMap(
  typeOfBubbles,
  studiesArray,
  labelsArrayX,
  labelsArrayY,
  cellWidth,
  labelRowWidth,
  chartHeight,
  cellHeight,
  labelColumnsHeight,
  initialDataForChart,
  totalRowName,
  totalRowBackgroundColor
) {
  let dataForChartForFiltration = JSON.parse(
    JSON.stringify(initialDataForChart)
  );

  dataForChartForFiltration.series.forEach((resultDataItem, index, array) => {
    labelsArrayX.forEach((labelColumn, index, array) => {
      labelsArrayY.forEach((labelRow, index, array) => {
        let tempArray = [];

        switch (typeOfBubbles) {
          case typeOfBubble2:
            //for each cell check whether the row and column values match
            studiesArray.forEach((studyItem, index, array) => {
              studyItem.bubbleTypesArray.forEach((bubbleType, index, array) => {
                if (
                  bubbleType.toLowerCase() == resultDataItem.name.toLowerCase()
                ) {
                  if (
                    studyItem.columnFilterArray.indexOf(labelColumn.trim()) >
                      -1 &&
                    studyItem.rowFilterArray.indexOf(labelRow.trim()) > -1
                  ) {
                    if (tempArray.indexOf(studyItem.studyTitle) === -1) {
                      // tempArray.push(studyItem.studyTitle.trim());
                      tempArray.push(
                        getTitleAsHTML(studyItem.studyTitle.trim(), studyLink)
                      );
                    }
                  }
                }
              });
            });

            break;

          case typeOfBubble1:
          default:
            let isColumnFilterMatched = false;
            //for each cell check whether the row and column values match
            studiesArray.forEach((studyItem, index, array) => {
              studyItem.bubbleTypesArray.forEach((bubbleType, index, array) => {
                //get value from square brackets
                if (bubbleType.match(/\[(.*?)\]/)) {
                  if (
                    bubbleType.match(/\[(.*?)\]/)[1] &&
                    bubbleType.match(/\[(.*?)\]/)[1].toLowerCase() ==
                      resultDataItem.name.toLowerCase()
                  ) {
                    isColumnFilterMatched = false;
                    for (columnFilter of studyItem.columnFilterArray) {
                      if (
                        columnFilter.split("[")[0].trim() == labelColumn.trim()
                      ) {
                        isColumnFilterMatched = true;
                        break;
                      }
                    }

                    if (
                      (labelRow == totalRowName && isColumnFilterMatched) ||
                      (isColumnFilterMatched &&
                        studyItem.rowFilterArray.indexOf(labelRow.trim()) > -1)
                    ) {
                      if (
                        tempArray.indexOf(
                          getTitleAsHTML(
                            studyItem.studyTitle.trim(),
                            studyItem.studyLink
                          )
                        ) === -1
                      ) {
                        tempArray.push(
                          getTitleAsHTML(
                            studyItem.studyTitle.trim(),
                            studyItem.studyLink
                          )
                        );
                      }
                    }
                  }
                }
              });
            });
        }

        const xCoord = getXCoord(
          labelColumn,
          resultDataItem.name,
          labelRowWidth,
          cellWidth,
          labelsArrayX,
          initialDataForChart
        );
        const yCoord = getYCoord(
          labelRow,
          resultDataItem.name,
          chartHeight,
          cellHeight,
          labelColumnsHeight,
          labelsArrayY
        );

        let tempObj = {
          x: xCoord,
          y: yCoord,
          z: tempArray.length * 2,
          name: tempArray.length + " studies",
          studies: tempArray,
          column: labelColumn,
          row: labelRow,
        };

        if (tempObj.studies.length > 0) {
          resultDataItem.data.push(tempObj);
        }
      });
    });
  });
  return dataForChartForFiltration;
}

function getFilteredStudiesArrayForEvidenceMap(
  studiesArray,
  filtersValuesFromFilterBlockArray
) {
  let resultArray = studiesArray.filter((study) => {
    let isAllFiltersMatchesFlagArray = [];

    study.filterBlock.forEach((studyFilter) => {
      let isAtLeastOneFilterValueMatch = false;
      filtersValuesFromFilterBlockArray.forEach((fblockFilter) => {
        if (studyFilter.title == fblockFilter.title) {
          if (
            fblockFilter.values.length == 0 &&
            studyFilter.values.length == 0
          ) {
            //if no filter value is selected and no study filter value exists
            isAtLeastOneFilterValueMatch = true;
          } else if (
            fblockFilter.values.length == 0 &&
            studyFilter.values.length > 0
          ) {
            //if no filter value is selected and study filter values exist
            isAtLeastOneFilterValueMatch = true;
          } else if (
            fblockFilter.values.length > 0 &&
            studyFilter.values.length == 0
          ) {
            //if filter value is selected but no study filter value exists
            isAtLeastOneFilterValueMatch = false;
          } else {
            studyFilter.values.forEach((studyFilterValue) => {
              fblockFilter.values.forEach((fblockFilterValue) => {
                if (studyFilterValue == fblockFilterValue) {
                  isAtLeastOneFilterValueMatch = true;
                }
              });
            });
          }
        }
      });

      isAllFiltersMatchesFlagArray.push(isAtLeastOneFilterValueMatch);
    });

    if (isAllFiltersMatchesFlagArray.indexOf(false) === -1) {
      return true;
    }
  });

  return resultArray;
}

function createStudyListTitleForEvidenceMap(
  studyListHeaderId,
  studyTitlesArray,
  columnName,
  rowName
) {
  let studyListHeaderElement = document.getElementById(studyListHeaderId);
  studyListHeaderElement.classList.add("study-list-header");
  studyListHeaderElement.innerHTML =
    columnName +
    " - " +
    rowName +
    "<br/>" +
    "Studies (" +
    studyTitlesArray.length +
    "): ";
}

function createStudyListForEvidenceMap(
  studyListItemWrapperId,
  studyTitlesArray
) {
  let studyListElement = document.getElementById(studyListItemWrapperId);
  studyListElement.innerHTML = "";

  studyTitlesArray.forEach((title) => {
    let studyListItemElement = document.createElement("div");
    studyListItemElement.classList.add("study-list-item");
    studyListItemElement.innerHTML = title;
    studyListElement.append(studyListItemElement);
  });

  let studyListWrapperButtonElement = document.createElement("a");
  studyListWrapperButtonElement.id = studyListItemWrapperId + "-btn";
  studyListWrapperButtonElement.classList.add("wp-block-button__link");
  studyListWrapperButtonElement.classList.add("has-background");
  studyListWrapperButtonElement.classList.add(
    "has-luminous-vivid-orange-background-color"
  );
  studyListWrapperButtonElement.innerHTML = "Export to CSV";
  studyListElement.append(studyListWrapperButtonElement);

  document
    .getElementById(studyListItemWrapperId + "-btn")
    .addEventListener("click", function () {
      downloadCSVForEvidenceMap(studyListItemWrapperId, "evidence-gap-map.csv");
    });
}

function getAndCreateChartForEvidenceMap(
  chartId,
  chartWidth,
  chartHeight,
  plotLinesX,
  plotLinesY,
  dataForChart,
  additionalItemsForChart,
  studyListHeaderId,
  studyListItemWrapperId
) {
  var chart = Highcharts.chart(chartId, {
    chart: {
      type: "bubble",
      plotBorderWidth: 1,
      marginTop: 100,
      zoomType: "",
    },

    legend: {
      enabled: true,
      align: "center",
      verticalAlign: "top",
      floating: true,
      x: 0,
      y: 20,
      itemDistance: 50,
      symbolPadding: 20,
      itemStyle: {
        fontSize: "20px",
      },
    },

    title: {
      text: "",
    },

    subtitle: {
      text: "",
    },

    xAxis: {
      lineWidth: 0,
      gridLineWidth: 0,
      labels: {
        enabled: false,
      },
      title: {
        text: null,
      },
      tickWidth: 0,
      tickLength: 0,
      min: 0,
      max: chartWidth,
      plotLines: plotLinesX,
    },

    yAxis: {
      lineWidth: 0,
      gridLineWidth: 0,
      labels: {
        enabled: false,
      },
      title: {
        text: null,
      },
      min: 0,
      max: chartHeight,
      plotLines: plotLinesY,
    },

    tooltip: {
      useHTML: true,
      followPointer: false,
      formatter: function () {
        let result =
          "<div style='max-height: 100px; background: none;'>" +
          '<div style="margin: 0; padding: 0 0.5rem"><th colspan="2"><h5>' +
          this.point.name +
          "</h5></th></div></div>";

        return result;
      },
      padding: 5,
      style: {
        pointerEvents: "auto",
      },
    },

    plotOptions: {
      bubble: {
        minSize: 3,
        maxSize: 50,
        zMin: 0,
        zMax: 100,
      },
      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              createStudyListTitleForEvidenceMap(
                studyListHeaderId,
                this.studies,
                this.column,
                this.row
              );
              createStudyListForEvidenceMap(
                studyListItemWrapperId,
                this.studies
              );
              document.getElementById(studyListItemWrapperId).scrollIntoView({
                block: "center",
                inline: "nearest",
                behavior: "smooth",
              });
            },
          },
        },
      },
    },

    series: dataForChart.series.concat(additionalItemsForChart),
  });

  return chart;
}

function createFiltersBlockComponentForEvidenceMap(
  mainComponentId,
  filterWrapperBlockId,
  updateButtonId,
  filterSelectClass,
  filtersBlockArray,
  filtersValuesFromSheetArray
) {
  let updateButtonWrapper = document.createElement("div");
  updateButtonWrapper.classList.add("button-block-wrapper");
  updateButtonWrapper.setAttribute(
    "style",
    "display: flex; align-items: center; justify-content: center; "
  );

  document.getElementById(mainComponentId).prepend(updateButtonWrapper);

  // Add update button for filters
  let filterWrapperBlockButtonElement = document.createElement("div");
  filterWrapperBlockButtonElement.classList.add("wp-block-button");
  filterWrapperBlockButtonElement.classList.add("custom-filter-btn");
  updateButtonWrapper.append(filterWrapperBlockButtonElement);

  // Id of this element is used in another place too
  let filterWrapperBlockButtonLinkElement = document.createElement("a");
  filterWrapperBlockButtonLinkElement.id = updateButtonId;
  filterWrapperBlockButtonLinkElement.classList.add("wp-block-button__link");
  filterWrapperBlockButtonLinkElement.classList.add("has-background");
  filterWrapperBlockButtonLinkElement.classList.add(
    "has-luminous-vivid-orange-background-color"
  );
  filterWrapperBlockButtonLinkElement.innerHTML = "Update";
  filterWrapperBlockButtonElement.append(filterWrapperBlockButtonLinkElement);

  // Add filters' block element
  let filterWrapperBlockElement = document.createElement("div");
  filterWrapperBlockElement.classList.add("filter-wrapper-block");
  filterWrapperBlockElement.id = filterWrapperBlockId;
  document.getElementById(mainComponentId).prepend(filterWrapperBlockElement);

  filtersBlockArray.forEach((filtersBlockArrayItem, indexOfblockFilter) => {
    // Add filters' wrapper element
    let filterWrapperElement = document.createElement("div");
    filterWrapperElement.classList.add("filter-wrapper");
    filterWrapperElement.setAttribute(
      "style",
      "display: flex; align-items: center"
    );
    filterWrapperBlockElement.append(filterWrapperElement);

    // Add title of filter
    let filterTitleElement = document.createElement("div");
    filterTitleElement.innerHTML = filtersBlockArrayItem.title;
    filterTitleElement.setAttribute("style", "padding: 0 1em");
    filterWrapperElement.append(filterTitleElement);

    // Add select to filter
    let filterSelectElement = document.createElement("select");
    filterSelectElement.id =
      mainComponentId +
      "-visualization-filter-" +
      filtersBlockArrayItem.title.replace(/\W/g, "_");
    filterSelectElement.name = filtersBlockArrayItem.title;
    filterSelectElement.classList.add(filterSelectClass);
    filterSelectElement.setAttribute("style", "margin: 1rem 2rem 1rem 0");
    filterSelectElement.setAttribute("multiple", "");
    filterWrapperElement.append(filterSelectElement);

    // Add default options to select

    filtersBlockArrayItem.defaultValues.forEach((defaultFilterValue) => {
      let filterSelectOptionElement = document.createElement("option");
      filterSelectOptionElement.innerHTML = defaultFilterValue;
      filterSelectOptionElement.setAttribute("value", defaultFilterValue);
      filterSelectElement.append(filterSelectOptionElement);
    });

    // Add unique filter's values from google sheet
    filtersValuesFromSheetArray.forEach((filtersValuesFromSheetArrayItem) => {
      if (
        filtersBlockArrayItem.title == filtersValuesFromSheetArrayItem.title
      ) {
        filtersValuesFromSheetArrayItem.values.forEach((filterValue) => {
          let isValueAlreadyAdded = false;
          Object.values(filterSelectElement.options).forEach(
            (existedOptionValue) => {
              if (existedOptionValue.innerHTML == filterValue.trim()) {
                isValueAlreadyAdded = true;
              }
            }
          );

          if (!isValueAlreadyAdded && filterValue) {
            let filterSelectOptionElement = document.createElement("option");
            filterSelectOptionElement.innerHTML = filterValue;
            filterSelectOptionElement.setAttribute("value", filterValue);
            filterSelectElement.append(filterSelectOptionElement);
          }
        });
      }
    });
  });

  // Add multiselection to filters
  let filterList = document.querySelectorAll(`.${filterSelectClass}`);
  filterList.forEach((filterNode) => {
    document.multiselect(`#${filterNode.id}`);
  });
}

function getStudiesArrayForEvidenceMap(data, settings) {
  let studiesArray = [];
  const cellsArray = data.feed.entry;
  const numberOfColumns = getNumberOfColumnsForEvidenceMap(cellsArray);
  const filtersBlockArray = settings.filtersBlockArray;

  let tempStudyTitle = "";
  let tempStudyLink = "";
  let tempTypesArray = [];
  let tempColumnFilterArray = [];
  let tempRowFilterArray = [];
  let tempFiltersBlockArray = initializeStudiesValuesArrayForEvidenceMap(
    filtersBlockArray
  );

  cellsArray.forEach((element, index, array) => {
    if (index >= numberOfColumns) {
      if (element.title["$t"].includes(settings.studyTitleLetter)) {
        tempStudyTitle = element.content["$t"].trim();
      }

      if (element.title["$t"].includes(settings.studyLinkLetter)) {
        tempStudyLink = element.content["$t"].trim();
      }

      if (element.title["$t"].includes(settings.bubbleTypeLetter)) {
        element.content["$t"]
          .split(evidenceGapMapValueSeparator)
          .forEach((cellValue) => {
            tempTypesArray.push(cellValue.trim());
          });
      }
      if (element.title["$t"].includes(settings.columnFilterLetter)) {
        element.content["$t"]
          .split(evidenceGapMapValueSeparator)
          .forEach((cellValue) => {
            tempColumnFilterArray.push(cellValue.trim());
          });
      }
      if (element.title["$t"].includes(settings.rowFilterLetter)) {
        element.content["$t"]
          .split(evidenceGapMapValueSeparator)
          .forEach((cellValue) => {
            tempRowFilterArray.push(cellValue.trim());
          });
      }

      filtersBlockArray.forEach((item, index) => {
        if (element.title["$t"].includes(item.letter)) {
          element.content["$t"]
            .split(evidenceGapMapValueSeparator)
            .forEach((cellValue) => {
              tempFiltersBlockArray.forEach((filterItem) => {
                if (filterItem.title == item.title.trim()) {
                  filterItem.values.push(cellValue.trim());
                }
              });
            });
        }
      });

      if (
        typeof array[index + 1] === "undefined" ||
        array[index].title["$t"] > array[index + 1].title["$t"]
      ) {
        // If study has title and country - add it to array
        if (
          tempStudyTitle.length > 0 &&
          tempTypesArray.length > 0 &&
          tempColumnFilterArray.length > 0 &&
          tempRowFilterArray.length > 0
        ) {
          let tempObj = {
            studyTitle: tempStudyTitle,
            studyLink: tempStudyLink,
            bubbleTypesArray: tempTypesArray,
            columnFilterArray: tempColumnFilterArray,
            rowFilterArray: tempRowFilterArray,
            filterBlock: tempFiltersBlockArray,
          };

          studiesArray.push(tempObj);

          tempStudyTitle = "";
          studyLink = "";
          tempTypesArray = [];
          tempColumnFilterArray = [];
          tempRowFilterArray = [];
          tempFiltersBlockArray = initializeStudiesValuesArrayForEvidenceMap(
            filtersBlockArray
          );
        } else {
          tempStudyTitle = "";
          studyLink = "";
          tempTypesArray = [];
          tempColumnFilterArray = [];
          tempRowFilterArray = [];
          tempFiltersBlockArray = initializeStudiesValuesArrayForEvidenceMap(
            filtersBlockArray
          );
        }
      }
    }
  });

  return studiesArray;
}

function getXCoord(
  labelColumn,
  itemType,
  labelRowWidth,
  cellWidth,
  labelsArrayX,
  initialDataForChart
) {
  let horizontalShift = 0;
  let result = 0;

  switch (itemType) {
    case initialDataForChart.series[0].name:
      horizontalShift = 0;
      result =
        labelRowWidth +
        (labelsArrayX.indexOf(labelColumn) + 1) * cellWidth -
        cellWidth / 2 +
        horizontalShift;
      break;

    case initialDataForChart.series[1].name:
      horizontalShift = 10;
      result =
        labelRowWidth +
        (labelsArrayX.indexOf(labelColumn) + 1) * cellWidth -
        cellWidth / 3 +
        horizontalShift;
      break;

    case initialDataForChart.series[2].name:
      horizontalShift = -10;
      result =
        labelRowWidth +
        (labelsArrayX.indexOf(labelColumn) + 1) * cellWidth -
        (cellWidth * 2) / 3 +
        horizontalShift;
      break;

    default:
      break;
  }

  return result;
}

function getYCoord(
  labelRow,
  itemType,
  chartHeight,
  cellHeight,
  labelColumnsHeight,
  labelsArrayY
) {
  return (
    chartHeight -
    labelColumnsHeight -
    (labelsArrayY.indexOf(labelRow) + 1) * cellHeight +
    cellHeight / 2
  );
}

function prepareGridAndCategoriesForEvidenceMap(
  mainComponentId,
  chartSettings,
  labelsArrayX,
  labelsArrayY,
  plotLinesX,
  plotLinesY,
  chartHeight,
  columnCount,
  rowCount,
  cellWidth,
  cellHeight,
  labelRowWidth,
  rowCategoryLabelWidth,
  labelColumnsHeight,
  totalRowName,
  toFixDimensions
) {
  const fontSize = 16;
  chartSettings.outcomesCategories.forEach((category, categoryIndex, array) => {
    const itemX = labelRowWidth + cellWidth * categoryIndex + cellWidth / 2;
    const itemY = labelColumnsHeight - fontSize * 2;

    let labelText = "";
    if (category.link) {
      labelText =
        '<a class="' +
        mainComponentId +
        '-category-to-anchor-link" ' +
        'style="text-decoration: none !important;" ' +
        ' target="_blank" ' +
        ' href="' +
        category.link +
        '">' +
        category.title +
        "</a>";
    } else {
      labelText = category.title;
    }

    plotLinesX.push({
      value: itemX,
      color: "#cccccc",
      width: 0,
      zIndex: 10,
      label: {
        useHTML: true,
        text: labelText,
        rotation: 270,
        x: 0,
        y: itemY,
        style: { fontSize: fontSize + "px" },
      },
    });
  });

  labelsArrayY.forEach((label) => {
    chartSettings.interventionsCategories.forEach(
      (category, categoryIndex, array) => {
        if (label == category.title) {
          const itemX = rowCategoryLabelWidth + fontSize * 2;
          const itemY =
            chartHeight -
            labelColumnsHeight -
            cellHeight * (categoryIndex + 1) +
            cellHeight / 2 -
            fontSize / 2;

          let labelText = "";
          if (category.link) {
            labelText =
              '<a class="' +
              mainComponentId +
              '-category-to-anchor-link" ' +
              'style="text-decoration: none !important;" ' +
              ' target="_blank" ' +
              ' href="' +
              category.link +
              '">' +
              category.title +
              "</a>";
          } else {
            labelText = category.title;
          }

          plotLinesY.push({
            value: itemY,
            color: "#cccccc",
            width: 0,
            zIndex: 10,
            label: {
              text: labelText,
              rotation: 360,
              x: itemX,
              y: 0,
              style: { fontSize: fontSize + "px" },
            },
          });
        }
      }
    );

    if (label == totalRowName) {
      const itemX = rowCategoryLabelWidth + fontSize * 2;
      const itemY =
        chartHeight -
        labelColumnsHeight -
        cellHeight * labelsArrayY.length +
        cellHeight / 2 -
        fontSize / 2;

      plotLinesY.push({
        value: itemY,
        color: "#cccccc",
        width: 0,
        zIndex: 10,
        label: {
          text: totalRowName,
          rotation: 360,
          x: itemX,
          y: 0,
          style: { fontSize: fontSize + "px" },
        },
      });
    }
  });

  let numberOfAlreadyCountedCategories = 0;
  chartSettings.interventionsBroadCategoriesTitles.forEach(
    (broadCategory, broadIndex) => {
      numberOfNarrowCategories = 0;

      //count narrow categories
      chartSettings.interventionsCategories.forEach((category) => {
        if (category.broadCategoryTitle == broadCategory) {
          numberOfNarrowCategories++;
        }
      });

      const fontSize = 20;
      let itemX = 30 + fontSize / 2;
      let itemY =
        chartHeight -
        labelColumnsHeight -
        cellHeight * numberOfNarrowCategories * 0.5 -
        cellHeight * numberOfAlreadyCountedCategories;

      plotLinesY.push({
        value: itemY,
        align: "center",
        color: "#cccccc",
        width: 0,
        zIndex: 10,
        label: {
          text: broadCategory,
          verticalAlign: "center",
          textAlign: "center",
          rotation: 270,
          x: itemX,
          y: 0,
          style: { fontSize: fontSize + "px" },
        },
      });

      numberOfAlreadyCountedCategories += numberOfNarrowCategories;
    }
  );

  numberOfAlreadyCountedCategories = 0;
  chartSettings.outcomesBroadCategoriesTitles.forEach(
    (broadCategory, broadIndex) => {
      numberOfNarrowCategories = 0;
      //count narrow categories
      chartSettings.outcomesCategories.forEach((category) => {
        if (category.broadCategoryTitle == broadCategory) {
          numberOfNarrowCategories++;
        }
      });

      const fontSize = 20;
      let itemY = 40;
      let itemX =
        labelRowWidth +
        cellWidth * numberOfNarrowCategories * 0.5 +
        cellWidth * numberOfAlreadyCountedCategories;

      plotLinesX.push({
        value: itemX,
        align: "center",
        color: "#cccccc",
        width: 0,
        zIndex: 10,
        label: {
          text: broadCategory,
          verticalAlign: "center",
          textAlign: "center",
          rotation: 0,
          x: 0,
          y: itemY,
          style: { fontSize: fontSize + "px" },
        },
      });

      numberOfAlreadyCountedCategories += numberOfNarrowCategories;
    }
  );

  // Add vertical lines
  for (i = 1; i < columnCount; i++) {
    plotLinesX.push({
      value: labelRowWidth + cellWidth * i,
      color: "#cccccc",
      width: 1,
      id: "plot-line-x" + i,
    });
  }

  // Add horizontal lines
  for (i = 1; i < rowCount; i++) {
    plotLinesY.push({
      value: cellHeight * i - toFixDimensions,
      color: "#cccccc",
      width: 1,
      id: "plot-line-y-" + i,
    });
  }

  //Add horizontal line after labels on top
  plotLinesX.push({
    value: labelRowWidth,
    color: "#cccccc",
    width: 1,
    id: "plot-line-label-x",
  });

  //Add vertical line after labels on left
  plotLinesY.push({
    value: chartHeight - labelColumnsHeight,
    color: "#cccccc",
    width: 1,
    id: "plot-line-label-y",
  });

  // to remove
  // chart.yAxis[0].removePlotLine(id);
}

async function getGoogleSheetForEvidenceMap(
  spreadsheetID,
  numberOfDataTableInGoogleSheet,
  numberOfSettingsTableInGoogleSheet,
  numberOfChartSettingsTableInGoogleSheet
) {
  // https://www.youtube.com/watch?v=MDKph2XhqXc
  try {
    const response = await fetch(
      `https://spreadsheets.google.com/feeds/worksheets/${spreadsheetID}/public/basic?alt=json`
    );
    const responseJSON = await response.json();
    const sheet = await fetch(
      responseJSON.feed.entry[numberOfDataTableInGoogleSheet - 1].link[1].href +
        "?alt=json"
    );
    const sheetJSON = await sheet.json();

    const settings = await fetch(
      responseJSON.feed.entry[numberOfSettingsTableInGoogleSheet - 1].link[1]
        .href + "?alt=json"
    );
    const settingsJSON = await settings.json();

    const chartSettings = await fetch(
      responseJSON.feed.entry[numberOfChartSettingsTableInGoogleSheet - 1]
        .link[1].href + "?alt=json"
    );
    const chartSettingsJSON = await chartSettings.json();

    return {
      sheet: sheetJSON,
      settings: settingsJSON,
      chartSettings: chartSettingsJSON,
    };
  } catch (error) {
    console.log(error);
  }
}

function getSettingsObjectForEvidenceMap(settings) {
  const cellsArray = settings.feed.entry;
  const numberOfColumns = getNumberOfColumnsForEvidenceMap(cellsArray);

  // Example of settings table
  //||Study title column letter||Study link column letter ||Type column letter||Column narrow category letter||Row narrow category letter||Filter titles||Filter column letter||Filter default values||
  //||D                        ||D                        ||N                 ||E                            ||H                         ||Study Method ||O                   || First | Second      ||

  const columnLetterOfStudyTitleColumnLetter = "A";
  const columnLetterOfStudyLinkColumnLetter = "B";
  const columnLetterOfColumnNarrowCategoryColumnLetter = "C";
  const columnLetterOfRowNarrowCategoryColumnLetter = "D";
  const columnLetterOfTypeOfBubbles = "E";
  const columnLetterOfTypeOfBubblesColumnLetter = "F";
  const columnLetterOfNameOfBubbles = "G";
  const columnLetterOfColorOfBubbles = "H";
  const columnLetterOfFilterTitles = "I";
  const columnLetterOfFilterColumnLetter = "J";
  const columnLetterOfFilterDefaultValues = "K";

  let tempStudyTitleLetter = "";
  let tempStudyLinkLetter = "";
  let tempColumnFilterLetter = "";
  let tempRowFilterLetter = "";
  let tempTypeOfBubbles = "";
  let tempBubbleTypeLetter = "";
  let tempBubbles = { series: [] };
  let tempFiltersBlockArray = [];

  let tempFiltersBlockItem = {
    letter: "",
    title: "",
    defaultValues: [],
  };

  let tempBubbleItem = {
    name: "",
    color: "",
    data: [],
  };

  cellsArray.forEach((element, index, array) => {
    if (index >= numberOfColumns) {
      // Study title column letter
      if (
        !tempStudyTitleLetter &&
        element.title["$t"].includes(columnLetterOfStudyTitleColumnLetter)
      ) {
        tempStudyTitleLetter = element.content["$t"].trim();
      }

      //Study link column letter
      if (
        !tempStudyLinkLetter &&
        element.title["$t"].includes(columnLetterOfStudyLinkColumnLetter)
      ) {
        tempStudyLinkLetter = element.content["$t"].trim();
      }

      //Column Categories (or Column Filter) - Outcome narrow category column letter
      if (
        !tempColumnFilterLetter &&
        element.title["$t"].includes(
          columnLetterOfColumnNarrowCategoryColumnLetter
        )
      ) {
        tempColumnFilterLetter = element.content["$t"].trim();
      }

      //Row Categories (or Row Filter) - Intervention narrow category column letter
      if (
        !tempRowFilterLetter &&
        element.title["$t"].includes(
          columnLetterOfRowNarrowCategoryColumnLetter
        )
      ) {
        tempRowFilterLetter = element.content["$t"].trim();
      }

      //Type of bubbles ( depend on article | depend on outcomes)
      if (
        !tempTypeOfBubbles &&
        element.title["$t"].includes(columnLetterOfTypeOfBubbles)
      ) {
        tempTypeOfBubbles = element.content["$t"].toLowerCase().trim();
      }

      //Type of bubbles column letter
      if (
        !tempBubbleTypeLetter &&
        element.title["$t"].includes(columnLetterOfTypeOfBubblesColumnLetter)
      ) {
        tempBubbleTypeLetter = element.content["$t"].trim();
      }

      //Names of bubbles
      if (element.title["$t"].includes(columnLetterOfNameOfBubbles)) {
        tempBubbleItem.name = element.content["$t"].trim();
      }
      //Color of bubbles
      if (
        tempBubbleItem.name == array[index - 1].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfColorOfBubbles)
      ) {
        tempBubbleItem.color = element.content["$t"].trim();
      }

      //Filter titles
      if (element.title["$t"].includes(columnLetterOfFilterTitles)) {
        tempFiltersBlockItem.title = element.content["$t"].trim();
      }

      //Filter column letter
      if (
        tempFiltersBlockItem.title == array[index - 1].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfFilterColumnLetter)
      ) {
        tempFiltersBlockItem.letter = element.content["$t"].trim();
      }

      //Filter default values
      if (
        tempFiltersBlockItem.title == array[index - 2].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfFilterDefaultValues)
      ) {
        element.content["$t"]
          .split(evidenceGapMapValueSeparator)
          .forEach((cellValue) => {
            tempFiltersBlockItem.defaultValues.push(cellValue.trim());
          });
      }

      if (
        typeof array[index + 1] === "undefined" ||
        array[index].title["$t"] > array[index + 1].title["$t"]
      ) {
        // Add Bubble to Bubbles' object
        if (tempBubbleItem.name) {
          tempBubbles.series.push(tempBubbleItem);
        }

        tempBubbleItem = {
          name: "",
          color: "",
          data: [],
        };

        // Add Filter to Filters' object
        if (tempFiltersBlockItem.title && tempFiltersBlockItem.letter) {
          tempFiltersBlockArray.push(tempFiltersBlockItem);
        }

        tempFiltersBlockItem = {
          letter: "",
          title: "",
          defaultValues: [],
        };
      }
    }
  });

  let resultObj = {
    studyTitleLetter: tempStudyTitleLetter,
    studyLinkLetter: tempStudyLinkLetter,
    columnFilterLetter: tempColumnFilterLetter,
    rowFilterLetter: tempRowFilterLetter,
    typeOfBubbles: tempTypeOfBubbles,
    bubbleTypeLetter: tempBubbleTypeLetter,
    bubbles: tempBubbles,
    filtersBlockArray: tempFiltersBlockArray,
  };

  return resultObj;
}

function getChartSettingsObjectForEvidenceMap(chartSettings) {
  const cellsArray = chartSettings.feed.entry;
  const numberOfColumns = getNumberOfColumnsForEvidenceMap(cellsArray);
  let resultObj = {};

  // Example of settings table
  //||Outcome broad categories||Outcome narrow categories||Outcome narrow categories Color||Intervention broad categories||Intervention narrow categories||Intervention categories Color||
  //||D                       ||N                        ||E                               ||H                            ||Study Method                  ||O                             ||

  const columnLetterOfOutcomeNarrowCategories = "A";
  const columnLetterOfOutcomeBroadCategories = "B";
  const columnLetterOfOutcomeNarrowCategoriesColor = "C";
  const columnLetterOfOutcomeNarrowCategoriesLinks = "D";
  const columnLetterOfInterventionNarrowCategories = "E";
  const columnLetterOfInterventionBroadCategories = "F";
  const columnLetterOfInterventionNarrowCategoriesColor = "G";
  const columnLetterOfInterventionNarrowCategoriesLinks = "H";
  const columnLetterOfTotalRowDisplayName = "I";
  const columnLetterOfTotalRowBackgroundColor = "J";

  let tempOutcomeBroadCategoryTitle = "";
  let tempOutcomeNarrowCategoriesArray = [];
  let tempInterventionBroadCategoryTitle = "";
  let tempInterventionNarrowCategoriesArray = [];

  let tempOutcomeCategoryItem = {
    title: "",
    broadCategoryTitle: "",
    color: "",
    link: "",
  };

  let tempInterventionCategoryItem = {
    title: "",
    broadCategoryTitle: "",
    color: "",
    link: "",
  };

  let tempTotalRowDisplayName = "";
  let tempTotalRowBackgroundColor = "";

  cellsArray.forEach((element, index, array) => {
    if (index >= numberOfColumns) {
      if (element.title["$t"].includes(columnLetterOfTotalRowDisplayName)) {
        tempTotalRowDisplayName = element.content["$t"].trim();
      }

      if (
        tempTotalRowDisplayName == array[index - 1].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfTotalRowBackgroundColor)
      ) {
        tempTotalRowBackgroundColor = element.content["$t"].trim();
      }

      // Outcomes
      if (element.title["$t"].includes(columnLetterOfOutcomeNarrowCategories)) {
        tempOutcomeCategoryItem.title = element.content["$t"].trim();
      }

      if (
        tempOutcomeCategoryItem.title ==
          array[index - 1].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfOutcomeBroadCategories)
      ) {
        tempOutcomeCategoryItem.broadCategoryTitle = element.content[
          "$t"
        ].trim();
      }

      if (
        tempOutcomeCategoryItem.title ==
          array[index - 2].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfOutcomeNarrowCategoriesColor)
      ) {
        tempOutcomeCategoryItem.color = element.content["$t"].trim();
      }

      if (
        tempOutcomeCategoryItem.title ==
          array[index - 3].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfOutcomeNarrowCategoriesLinks)
      ) {
        tempOutcomeCategoryItem.link = element.content["$t"].trim();
      }

      //Interventions
      if (
        element.title["$t"].includes(columnLetterOfInterventionNarrowCategories)
      ) {
        tempInterventionCategoryItem.title = element.content["$t"].trim();
      }

      if (
        tempInterventionCategoryItem.title ==
          array[index - 1].content["$t"].trim() &&
        element.title["$t"].includes(columnLetterOfInterventionBroadCategories)
      ) {
        tempInterventionCategoryItem.broadCategoryTitle = element.content[
          "$t"
        ].trim();
      }

      if (
        tempInterventionCategoryItem.title ==
          array[index - 2].content["$t"].trim() &&
        element.title["$t"].includes(
          columnLetterOfInterventionNarrowCategoriesColor
        )
      ) {
        tempInterventionCategoryItem.color = element.content["$t"].trim();
      }

      if (
        tempInterventionCategoryItem.title ==
          array[index - 3].content["$t"].trim() &&
        element.title["$t"].includes(
          columnLetterOfInterventionNarrowCategoriesLinks
        )
      ) {
        tempInterventionCategoryItem.link = element.content["$t"].trim();
      }

      // if sheet row ends
      if (
        typeof array[index + 1] === "undefined" ||
        array[index].title["$t"] > array[index + 1].title["$t"]
      ) {
        if (
          tempOutcomeCategoryItem.title &&
          tempOutcomeCategoryItem.broadCategoryTitle
        ) {
          tempOutcomeNarrowCategoriesArray.push(tempOutcomeCategoryItem);
        }

        if (
          tempInterventionCategoryItem.title &&
          tempInterventionCategoryItem.broadCategoryTitle
        ) {
          tempInterventionNarrowCategoriesArray.push(
            tempInterventionCategoryItem
          );
        }

        tempOutcomeCategoryItem = {
          title: "",
          broadCategoryTitle: "",
          color: "",
          link: "",
        };
        tempInterventionCategoryItem = {
          title: "",
          broadCategoryTitle: "",
          color: "",
          link: "",
        };
      }
    }
  });

  let tempOutcomeBroadCategoriesTitlesArray = [];
  let tempInterventionBroadCategoriesTitlesArray = [];
  let tempOutcomeNarrowCategoriesTitlesArray = [];
  let tempInterventionNarrowCategoriesTitlesArray = [];

  tempOutcomeNarrowCategoriesArray.forEach((element) => {
    if (
      tempOutcomeBroadCategoriesTitlesArray.indexOf(
        element.broadCategoryTitle
      ) === -1
    ) {
      tempOutcomeBroadCategoriesTitlesArray.push(element.broadCategoryTitle);
    }
  });

  tempInterventionNarrowCategoriesArray.forEach((element) => {
    if (
      tempInterventionBroadCategoriesTitlesArray.indexOf(
        element.broadCategoryTitle
      ) === -1
    ) {
      tempInterventionBroadCategoriesTitlesArray.push(
        element.broadCategoryTitle
      );
    }
  });

  tempOutcomeNarrowCategoriesArray.forEach((element) => {
    tempOutcomeNarrowCategoriesTitlesArray.push(element.title);
  });
  tempInterventionNarrowCategoriesArray.forEach((element) => {
    tempInterventionNarrowCategoriesTitlesArray.push(element.title);
  });

  resultObj.outcomesCategories = tempOutcomeNarrowCategoriesArray;
  resultObj.interventionsCategories = tempInterventionNarrowCategoriesArray;
  resultObj.outcomesBroadCategoriesTitles = tempOutcomeBroadCategoriesTitlesArray;
  resultObj.interventionsBroadCategoriesTitles = tempInterventionBroadCategoriesTitlesArray;
  resultObj.outcomesNarrowCategoriesTitles = tempOutcomeNarrowCategoriesTitlesArray;
  resultObj.interventionsNarrowCategoriesTitles = tempInterventionNarrowCategoriesTitlesArray;
  resultObj.totalRowName = tempTotalRowDisplayName;
  resultObj.totalRowBackgroundColor = tempTotalRowBackgroundColor;

  return resultObj;
}

function initializeStudiesValuesArrayForEvidenceMap(filtersBlockArray) {
  let tempFiltersBlockArray = [];
  filtersBlockArray.forEach((item, index) => {
    let tempObj = {
      title: item.title.trim(),
      letter: item.letter,
      values: [],
    };
    tempFiltersBlockArray.push(tempObj);
  });
  return tempFiltersBlockArray;
}

function getNumberOfColumnsForEvidenceMap(array) {
  let i = 0;
  let numberOfColumns = 0;
  for (let cell of array) {
    if (array[i + 1] && array[i].title["$t"] > array[i + 1].title["$t"]) {
      numberOfColumns++;
      break;
    } else {
      numberOfColumns++;
      i++;
    }
  }

  return numberOfColumns;
}

function downloadCSVForEvidenceMap(studyListItemWrapperId, filename) {
  let csvRows = [];
  let rows = document.querySelectorAll(
    "#" + studyListItemWrapperId + " .study-list-item a"
  );

  rows.forEach((row) => {
    let tempArr = [];
    tempArr.push(row.innerText.replace(/"/g, "`"));
    tempArr.push(row.href);
    csvRows.push(tempArr);
  });

  exportToCsvForEvidenceMap(filename, csvRows);
}

function exportToCsvForEvidenceMap(filename, rows) {
  var processRow = function (row) {
    var finalVal = "";
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? "" : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ",";
      finalVal += result;
    }
    return finalVal + "\n";
  };

  var csvFile = "";
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
