if (
  typeof jQuery != "undefined" &&
  typeof document.multiselect === "function"
) {
  const evidenceGapMapVisualizationClass = "evidence-gap-map-visualization";
  const evidenceGapMapValueSeparator = "|"; //Separator is used to separate values in cells of sheet
  const typeOfBubble1 = "depend on outcomes"; // Type of evidence gap visualization
  const typeOfBubble2 = "depend on article";

  //Collect all elements, where evidence gap map is needed
  let evidenceGapMapElementsArray = document.querySelectorAll(
    "." + evidenceGapMapVisualizationClass
  );

  evidenceGapMapElementsArray.forEach((evidenceGapMapElement) => {
    createEvidenceGapMapVizualization(
      evidenceGapMapElement,
      evidenceGapMapValueSeparator,
      typeOfBubble1,
      typeOfBubble2
    );
  });

  function createEvidenceGapMapVizualization(
    evidenceGapMapElement,
    evidenceGapMapValueSeparator,
    typeOfBubble1,
    typeOfBubble2
  ) {
    const websiteURL = evidenceGapMapElement.attributes["website-url"].value;
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
    const numberOfDataSettingsTableInGoogleSheet =
      +evidenceGapMapElement.attributes["data-settings-table"].value || 3;
    const numberOfChartSettingsTableInGoogleSheet =
      +evidenceGapMapElement.attributes["chart-settings-table"].value || 4;
    const chartScale =
      +evidenceGapMapElement.attributes["chart-scale"].value || 0.8;

    getGoogleSheet(
      websiteURL,
      numberOfDataTableInGoogleSheet,
      numberOfDataSettingsTableInGoogleSheet,
      numberOfChartSettingsTableInGoogleSheet
    ).then((data) => {
      // Clear main wrapper before adding components
      document.getElementById(mainComponentId).innerHTML = "";

      createInitialComponentForEvidenceMap(
        mainComponentId,
        chartContainerId,
        chartId,
        studyListHeaderId,
        studyListItemWrapperId
      );

      //Initialize all variables for the visualization
      let dataSettings = getDataSettingsEvidence(
        data.dataSettings,
        evidenceGapMapValueSeparator
      );
      let chartSettings = getChartSettingsEvidence(data.chartSettings);

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
      totalRowName = chartSettings.totalRowName || "Total";
      totalRowBackgroundColor = chartSettings.totalRowBackgroundColor || "gray";
      labelsArrayY.push(totalRowName);

      let filtersBlockArray = dataSettings.filtersBlockArray;

      // Variables for chart
      const columnCount = labelsArrayX.length;
      const rowCount = labelsArrayY.length;
      const columnCategoryLabelHeight = 80;
      const rowCategoryLabelWidth = 80;
      const labelColumnsHeight = 250 + columnCategoryLabelHeight;
      const labelRowWidth = 300 + rowCategoryLabelWidth;
      const chartWidth = 2200;
      const chartHeight = 2500;
      const cellWidth = (chartWidth - labelRowWidth) / columnCount;
      const cellHeight = (chartHeight - labelColumnsHeight) / rowCount;
      chartElement.style.height = chartHeight + "px";
      chartElement.style.width = chartWidth + "px";
      chartElement.style.transform = "scale(" + chartScale + ")";
      chartElement.style.transformOrigin = "top left";
      chartContainerElement.style.height =
        chartHeight * (chartScale + 0.01) + "px";
      chartContainerElement.style.width = "100%";

      //Prepare an array of studies
      const arrayOfStudies = getStudiesArrayForEvidenceMap(
        data.sheet,
        dataSettings,
        evidenceGapMapValueSeparator
      );

      //Prepare initial structure for filters data
      filtersValuesToFilter =
        initializeStudiesValuesArrayForEvidenceMap(filtersBlockArray);

      //Transform data in suitable for highcharts format
      let dataForChart = getDataForChartForEvidenceMap(
        dataSettings,
        arrayOfStudies,
        labelsArrayX,
        labelsArrayY,
        cellWidth,
        labelRowWidth,
        chartHeight,
        cellHeight,
        labelColumnsHeight,
        totalRowName
      );

      prepareGridAndCategoriesForEvidenceMap(
        plotLinesX,
        plotLinesY,
        mainComponentId,
        chartSettings,
        labelsArrayX,
        labelsArrayY,
        chartHeight,
        cellWidth,
        cellHeight,
        labelRowWidth,
        rowCategoryLabelWidth,
        labelColumnsHeight,
        totalRowName
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
        totalRowBackgroundColor
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
        dataSettings,
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
        chartHeight,
        chartWidth,
        cellHeight,
        labelColumnsHeight,
        totalRowName
      );
    });

    async function getGoogleSheet(
      websiteURL,
      numberOfDataTableInGoogleSheet,
      numberOfDataSettingsTableInGoogleSheet,
      numberOfChartSettingsTableInGoogleSheet
    ) {
      try {
        const sheet = await fetch(
          `${websiteURL}/wp-json/google-sheets-api/get-data?tab=${
            numberOfDataTableInGoogleSheet - 1
          }`
        );
        const sheetJSON = await sheet.json();

        const dataSettings = await fetch(
          `${websiteURL}/wp-json/google-sheets-api/get-data/?tab=${
            numberOfDataSettingsTableInGoogleSheet - 1
          }`
        );
        const dataSettingsJSON = await dataSettings.json();

        const chartSettings = await fetch(
          `${websiteURL}/wp-json/google-sheets-api/get-data/?tab=${
            numberOfChartSettingsTableInGoogleSheet - 1
          }`
        );
        const chartSettingsJSON = await chartSettings.json();

        return {
          sheet: sheetJSON,
          dataSettings: dataSettingsJSON,
          chartSettings: chartSettingsJSON,
        };
      } catch (error) {
        console.log(error);
      }
    }

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

    function getDataSettingsEvidence(
      dataSettings,
      evidenceGapMapValueSeparator
    ) {
      // Example of settings table
      //||sheet column title for 'Study title'||sheet column title for 'Study link'||sheet column title for Outcome narrow category||sheet column title for Intervention narrow category||Type of bubbles ( depend on article | depend on outcomes )||sheet column title for Type of bubbles in sheet||Names of bubbles||Colour of bubbles||Filter titles||sheet column title for Filter column||Filter default values||
      //||Title for Display                   ||URL                                ||Outcomes Positive, Nil or Mentioned           ||Interventions Narrow Categories                    ||depend on outcomes                                        ||Outcomes Positive, Nil or Mentioned   ||Positive        ||#32CD32          ||Country      ||Countries                           ||                     ||

      const sheetColumnNumberOfStudyTitle = 0;
      const sheetColumnNumberOfStudyLink = 1;
      const sheetColumnNumberOfColumnNarrowCategory = 2;
      const sheetColumnNumberOfRowNarrowCategory = 3;
      const sheetColumnNumberOfTypeOfBubbles = 4;
      const sheetColumnNumberOfTypeOfBubblesInSheet = 5;
      const sheetColumnNumberOfNameOfBubbles = 6;
      const sheetColumnNumberOfColorOfBubbles = 7;
      const sheetColumnNumberOfFilterTitles = 8;
      const sheetColumnNumberOfColumnTitlesOfFilterValues = 9;
      const sheetColumnNumberOfFilterDefaultValues = 10;

      let config = {
        sheetColumnTitleOfStudyTitle: "",
        sheetColumnTitleOfStudyLink: "",
        sheetColumnTitleOfColumnFilter: "",
        sheetColumnTitleOfRowFilter: "",
        typeOfBubbles: "",
        sheetColumnTitleOfBubbleType: "",
        bubbles: { series: [] },
        filtersBlockArray: [],
      };

      dataSettings.forEach((row, rowIndex) => {
        if (rowIndex === 1) {
          config.sheetColumnTitleOfStudyTitle =
            row[sheetColumnNumberOfStudyTitle]?.trim();
          config.sheetColumnTitleOfStudyLink =
            row[sheetColumnNumberOfStudyLink]?.trim();
          config.sheetColumnTitleOfColumnFilter =
            row[sheetColumnNumberOfColumnNarrowCategory]?.trim();
          config.sheetColumnTitleOfRowFilter =
            row[sheetColumnNumberOfRowNarrowCategory]?.trim();
          config.typeOfBubbles = row[sheetColumnNumberOfTypeOfBubbles]?.trim();
          config.sheetColumnTitleOfBubbleType =
            row[sheetColumnNumberOfTypeOfBubblesInSheet]?.trim();
        }
        if (rowIndex >= 1) {
          let tempBubbleItem = {
            name: row[sheetColumnNumberOfNameOfBubbles]?.trim(),
            color: row[sheetColumnNumberOfColorOfBubbles]?.trim(),
            data: [],
          };

          let tempFiltersBlockItem = {
            title: row[sheetColumnNumberOfFilterTitles]?.trim(),
            sheetColumnTitle:
              row[sheetColumnNumberOfColumnTitlesOfFilterValues]?.trim(),
            defaultValues: [],
          };
          row[sheetColumnNumberOfFilterDefaultValues]
            ?.split(evidenceGapMapValueSeparator)
            .forEach((cellValue) => {
              tempFiltersBlockItem.defaultValues.push(cellValue?.trim());
            });

          if (tempBubbleItem.name) {
            config.bubbles.series.push(tempBubbleItem);
          }

          if (
            tempFiltersBlockItem.title &&
            tempFiltersBlockItem.sheetColumnTitle
          ) {
            config.filtersBlockArray.push(tempFiltersBlockItem);
          }
        }
      });

      return config;
    }

    function getChartSettingsEvidence(chartSettings) {
      // Example of settings table
      //||Outcome narrow categories||Outcome broad categories             ||Outcome narrow categories colour||Outcome narrow category link                    ||Intervention narrow categories||Intervention broad categories||Intervention categories colour||Intervention narrow category link                    ||Total row display name||Total row background color||
      //||Income                   ||Agricultural-led<br/> economic growth||#5fb947                         ||https://url/?page_id=714#report-outcomes-section||Extension                     ||Digital Advisory & Extension ||#67e0fe                       ||https://url/?page_id=714#report-interventions-section||Total                 ||#E8E8E8                   ||

      const sheetColumnNumberOfOutcomeNarrowCategories = 0;
      const sheetColumnNumberOfOutcomeBroadCategories = 1;
      const sheetColumnNumberOfOutcomeNarrowCategoriesColor = 2;
      const sheetColumnNumberOfOutcomeNarrowCategoriesLinks = 3;
      const sheetColumnNumberOfInterventionNarrowCategories = 4;
      const sheetColumnNumberOfInterventionBroadCategories = 5;
      const sheetColumnNumberOfInterventionNarrowCategoriesColor = 6;
      const sheetColumnNumberOfInterventionNarrowCategoriesLinks = 7;
      const sheetColumnNumberOfTotalRowDisplayName = 8;
      const sheetColumnNumberOfTotalRowBackgroundColor = 9;

      config = {
        outcomesCategories: [],
        interventionsCategories: [],
        totalRowName: "",
        totalRowBackgroundColor: "",
      };

      chartSettings.forEach((row, rowIndex) => {
        if (rowIndex >= 1) {
          config.totalRowName =
            row[sheetColumnNumberOfTotalRowDisplayName]?.trim();
          config.totalRowBackgroundColor =
            row[sheetColumnNumberOfTotalRowBackgroundColor]?.trim();

          let tempOutcomeCategoryItem = {
            title: row[sheetColumnNumberOfOutcomeNarrowCategories]?.trim(),
            broadCategoryTitle:
              row[sheetColumnNumberOfOutcomeBroadCategories]?.trim(),
            color: row[sheetColumnNumberOfOutcomeNarrowCategoriesColor]?.trim(),
            link: row[sheetColumnNumberOfOutcomeNarrowCategoriesLinks]?.trim(),
          };

          let tempInterventionCategoryItem = {
            title: row[sheetColumnNumberOfInterventionNarrowCategories]?.trim(),
            broadCategoryTitle:
              row[sheetColumnNumberOfInterventionBroadCategories]?.trim(),
            color:
              row[sheetColumnNumberOfInterventionNarrowCategoriesColor]?.trim(),
            link: row[
              sheetColumnNumberOfInterventionNarrowCategoriesLinks
            ]?.trim(),
          };

          if (
            tempOutcomeCategoryItem.title &&
            tempOutcomeCategoryItem.broadCategoryTitle
          ) {
            config.outcomesCategories.push(tempOutcomeCategoryItem);
          }

          if (
            tempInterventionCategoryItem.title &&
            tempInterventionCategoryItem.broadCategoryTitle
          ) {
            config.interventionsCategories.push(tempInterventionCategoryItem);
          }
        }
      });

      return config;
    }

    function getStudiesArrayForEvidenceMap(
      sheet,
      dataSettings,
      evidenceGapMapValueSeparator
    ) {
      let studiesArray = [];

      sheet.forEach((row, rowIndex) => {
        if (rowIndex >= 1) {
          let study = {
            studyTitle: "",
            studyLink: "",
            bubbleTypesArray: [],
            columnFilterArray: [],
            rowFilterArray: [],
            filtersBlockArray: [],
          };

          dataSettings.filtersBlockArray.forEach((configFilter) => {
            let filter = {
              title: configFilter.title,
              sheetColumnTitle: configFilter.sheetColumnTitle,
              values: [],
            };

            study.filtersBlockArray.push(filter);
          });

          row.forEach((cell, cellIndex) => {
            if (
              sheet[0][cellIndex]?.trim() ===
              dataSettings.sheetColumnTitleOfStudyTitle
            ) {
              study.studyTitle = cell;
            }

            if (
              sheet[0][cellIndex]?.trim() ===
              dataSettings.sheetColumnTitleOfStudyLink
            ) {
              study.studyLink = cell;
            }

            if (
              sheet[0][cellIndex]?.trim() ===
              dataSettings.sheetColumnTitleOfBubbleType
            ) {
              cell?.split(evidenceGapMapValueSeparator).forEach((cellValue) => {
                study.bubbleTypesArray.push(cellValue?.trim());
              });
            }

            if (
              sheet[0][cellIndex]?.trim() ===
              dataSettings.sheetColumnTitleOfColumnFilter
            ) {
              cell?.split(evidenceGapMapValueSeparator).forEach((cellValue) => {
                study.columnFilterArray.push(cellValue?.trim());
              });
            }

            if (
              sheet[0][cellIndex]?.trim() ===
              dataSettings.sheetColumnTitleOfRowFilter
            ) {
              cell?.split(evidenceGapMapValueSeparator).forEach((cellValue) => {
                study.rowFilterArray.push(cellValue?.trim());
              });
            }

            study.filtersBlockArray.forEach((filter) => {
              if (
                cell &&
                sheet[0][cellIndex]?.trim() === filter.sheetColumnTitle
              ) {
                cell
                  ?.split(evidenceGapMapValueSeparator)
                  .forEach((cellValue) => {
                    filter.values.push(cellValue?.trim());
                  });
              }
            });
          });

          // If study has title, bubble type, at least one column filter value, at least one row filter, then add it to visualization
          if (
            study.studyTitle.length > 0 &&
            study.bubbleTypesArray.length > 0 &&
            study.columnFilterArray.length > 0 &&
            study.rowFilterArray.length > 0
          ) {
            studiesArray.push(study);
          }
        }
      });

      return studiesArray;
    }

    function initializeStudiesValuesArrayForEvidenceMap(filtersBlockArray) {
      let tempFiltersBlockArray = [];
      filtersBlockArray.forEach((item, index) => {
        let tempObj = {
          title: item.title.trim(),
          sheetColumnTitle: item.sheetColumnTitle,
          values: [],
        };
        tempFiltersBlockArray.push(tempObj);
      });
      return tempFiltersBlockArray;
    }

    function getDataForChartForEvidenceMap(
      dataSettings,
      studiesArray,
      labelsArrayX,
      labelsArrayY,
      cellWidth,
      labelRowWidth,
      chartHeight,
      cellHeight,
      labelColumnsHeight,
      totalRowName
    ) {
      //create a copy of bubbles' object to fill in
      let dataForChartForFiltration = JSON.parse(
        JSON.stringify(dataSettings.bubbles)
      );

      dataForChartForFiltration.series.forEach((resultDataItem) => {
        labelsArrayX.forEach((labelColumn) => {
          labelsArrayY.forEach((labelRow) => {
            let tempArray = [];
            let isColumnFilterMatched = false;

            switch (dataSettings.typeOfBubbles) {
              case typeOfBubble2:
                //for each cell check whether the row and column values match
                studiesArray.forEach((studyItem) => {
                  studyItem.bubbleTypesArray.forEach((bubbleType) => {
                    if (
                      bubbleType.trim().toLowerCase() ==
                      resultDataItem.name.toLowerCase()
                    ) {
                      isColumnFilterMatched = false;
                      for (columnFilter of studyItem.columnFilterArray) {
                        if (
                          columnFilter.split("[")[0].trim() ===
                          labelColumn.trim()
                        ) {
                          isColumnFilterMatched = true;
                          break;
                        }
                      }

                      if (
                        (labelRow === totalRowName && isColumnFilterMatched) ||
                        (isColumnFilterMatched &&
                          studyItem.rowFilterArray.indexOf(labelRow.trim()) >
                            -1)
                      ) {
                        const title = getTitleAsHTML(
                          studyItem.studyTitle.trim(),
                          studyItem.studyLink
                        );
                        if (tempArray.indexOf(title) === -1) {
                          tempArray.push(title);
                        }
                      }
                    }
                  });
                });

                break;

              case typeOfBubble1:
              default:
                //for each cell check whether the row and column values match
                studiesArray.forEach((studyItem) => {
                  studyItem.bubbleTypesArray.forEach((bubbleType) => {
                    const bubbleValue = bubbleType.match(/\[(.*?)\]/);
                    //get value from square brackets
                    if (bubbleValue) {
                      if (
                        bubbleValue[1] &&
                        bubbleValue[1].toLowerCase() ===
                          resultDataItem.name.toLowerCase()
                      ) {
                        isColumnFilterMatched = false;
                        for (columnFilter of studyItem.columnFilterArray) {
                          if (
                            columnFilter.split("[")[0].trim() ===
                            labelColumn.trim()
                          ) {
                            isColumnFilterMatched = true;
                            break;
                          }
                        }

                        if (
                          (labelRow === totalRowName &&
                            isColumnFilterMatched) ||
                          (isColumnFilterMatched &&
                            studyItem.rowFilterArray.indexOf(labelRow.trim()) >
                              -1)
                        ) {
                          const title = getTitleAsHTML(
                            studyItem.studyTitle.trim(),
                            studyItem.studyLink
                          );
                          if (tempArray.indexOf(title) === -1) {
                            tempArray.push(title);
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
              dataSettings.bubbles
            );
            const yCoord = getYCoord(
              labelRow,
              chartHeight,
              cellHeight,
              labelColumnsHeight,
              labelsArrayY
            );

            let tempObj = {
              column: labelColumn,
              row: labelRow,
              name: tempArray.length + " studies",
              x: xCoord,
              y: yCoord,
              z: tempArray.length * 2,
              studies: tempArray,
            };

            if (tempObj.studies.length > 0) {
              resultDataItem.data.push(tempObj);
            }
          });
        });
      });
      return dataForChartForFiltration;
    }

    function getXCoord(
      labelColumn,
      itemType,
      labelRowWidth,
      cellWidth,
      labelsArrayX,
      bubbles
    ) {
      let result = 0;
      bubbles.series.forEach((bubble, index) => {
        if (bubble.name === itemType) {
          result =
            labelRowWidth +
            labelsArrayX.indexOf(labelColumn) * cellWidth +
            (cellWidth / (bubbles.series.length + 1)) * (index + 1);
        }
      });

      return Math.round(result);
    }

    function getYCoord(
      labelRow,
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

    function getTitleAsHTML(title, link) {
      if (typeof link === "string" && link.length > 0) {
        return `<a href="${link}" target="_blank"> ${title} </a>`;
      } else {
        return title;
      }
    }

    function prepareGridAndCategoriesForEvidenceMap(
      plotLinesX,
      plotLinesY,
      mainComponentId,
      chartSettings,
      labelsArrayX,
      labelsArrayY,
      chartHeight,
      cellWidth,
      cellHeight,
      labelRowWidth,
      rowCategoryLabelWidth,
      labelColumnsHeight,
      totalRowName
    ) {
      // Categories
      const interventionsBroadCategoriesTitles = [
        ...new Set(
          chartSettings.interventionsCategories.map(
            (el) => el.broadCategoryTitle
          )
        ),
      ];
      const outcomesBroadCategoriesTitles = [
        ...new Set(
          chartSettings.outcomesCategories.map((el) => el.broadCategoryTitle)
        ),
      ];

      //Add narrow Outcome categories
      const fontSize = 16;
      chartSettings.outcomesCategories.forEach((category, categoryIndex) => {
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

      //Add narrow Intervention categories
      labelsArrayY.forEach((label) => {
        chartSettings.interventionsCategories.forEach(
          (category, categoryIndex) => {
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

      //Add broad Intervention  Categories
      let numberOfAlreadyCountedCategories = 0;
      interventionsBroadCategoriesTitles.forEach((broadCategory) => {
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
      });

      //Add broad Outcome  Categories
      numberOfAlreadyCountedCategories = 0;
      outcomesBroadCategoriesTitles.forEach((broadCategory) => {
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
      });

      //Grid
      //Add vertical lines
      for (i = 1; i < labelsArrayX.length; i++) {
        plotLinesX.push({
          value: labelRowWidth + cellWidth * i,
          color: "#cccccc",
          width: 1,
          id: "plot-line-x" + i,
        });
      }

      //Add horizontal lines
      for (i = 1; i < labelsArrayY.length; i++) {
        plotLinesY.push({
          value: cellHeight * i,
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

    function addBackgroundsForHighchartForEvidenceMap(
      chartSettings,
      chartWidth,
      chartHeight,
      cellWidth,
      cellHeight,
      labelRowWidth,
      labelColumnsHeight,
      totalRowName,
      totalRowBackgroundColor
    ) {
      let resultArray = [];

      //add outcome backgrounds
      chartSettings.outcomesCategories.forEach((category, index, array) => {
        if (category.color) {
          coord1 = [labelRowWidth + cellWidth * index, chartHeight];
          coord2 = [
            labelRowWidth + cellWidth * index + cellWidth + 1,
            chartHeight,
          ];
          coord3 = [
            labelRowWidth + cellWidth * index + cellWidth + 1,
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
      chartSettings.interventionsCategories.forEach(
        (category, index, array) => {
          if (category.color) {
            coord1 = [0, chartHeight - labelColumnsHeight - cellHeight * index];
            coord2 = [
              labelRowWidth,
              chartHeight - labelColumnsHeight - cellHeight * index,
            ];
            coord3 = [
              labelRowWidth,
              chartHeight - labelColumnsHeight - cellHeight * (index + 1) - 1,
            ];
            coord4 = [
              0,
              chartHeight - labelColumnsHeight - cellHeight * (index + 1) - 1,
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
        }
      );

      // add total background
      const totalRow = chartSettings.interventionsCategories.length;
      if (totalRowName && totalRowBackgroundColor) {
        coord1 = [0, chartHeight - labelColumnsHeight - cellHeight * totalRow];
        coord2 = [
          labelRowWidth,
          chartHeight - labelColumnsHeight - cellHeight * totalRow,
        ];
        coord3 = [
          labelRowWidth,
          chartHeight - labelColumnsHeight - cellHeight * (totalRow + 1), 
        ];
        coord4 = [
          0,
          chartHeight - labelColumnsHeight - cellHeight * (totalRow + 1), 
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
                  document
                    .getElementById(studyListItemWrapperId)
                    .scrollIntoView({
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
          downloadCSVForEvidenceMap(
            studyListItemWrapperId,
            "evidence-gap-map.csv"
          );
        });
    }

    function getArrayOfFiltersValueForEvidenceMap(
      studiesArray,
      filtersBlockArray
    ) {
      let filtersValuesFromSheetArray =
        initializeStudiesValuesArrayForEvidenceMap(filtersBlockArray);

      // Create array with all filters values
      studiesArray.forEach((study) => {
        study.filtersBlockArray.forEach((studyFilterItem) => {
          studyFilterItem.values.forEach((studyFilterItemValue) => {
            filtersValuesFromSheetArray.forEach((filterArrayTemp) => {
              if (filterArrayTemp.title == studyFilterItem.title) {
                if (
                  filterArrayTemp.values.indexOf(studyFilterItemValue) === -1
                ) {
                  filterArrayTemp.values.push(studyFilterItemValue.trim());
                }
              }
            });
          });
        });
      });

      return filtersValuesFromSheetArray;
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
      filterWrapperBlockButtonLinkElement.classList.add(
        "wp-block-button__link"
      );
      filterWrapperBlockButtonLinkElement.classList.add("has-background");
      filterWrapperBlockButtonLinkElement.classList.add(
        "has-luminous-vivid-orange-background-color"
      );
      filterWrapperBlockButtonLinkElement.innerHTML = "Update";
      filterWrapperBlockButtonElement.append(
        filterWrapperBlockButtonLinkElement
      );

      // Add filters' block element
      let filterWrapperBlockElement = document.createElement("div");
      filterWrapperBlockElement.classList.add("filter-wrapper-block");
      filterWrapperBlockElement.id = filterWrapperBlockId;
      document
        .getElementById(mainComponentId)
        .prepend(filterWrapperBlockElement);

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
        filtersValuesFromSheetArray.forEach(
          (filtersValuesFromSheetArrayItem) => {
            if (
              filtersBlockArrayItem.title ==
              filtersValuesFromSheetArrayItem.title
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
                  let filterSelectOptionElement =
                    document.createElement("option");
                  filterSelectOptionElement.innerHTML = filterValue;
                  filterSelectOptionElement.setAttribute("value", filterValue);
                  filterSelectElement.append(filterSelectOptionElement);
                }
              });
            }
          }
        );
      });

      // Add multiselection to filters
      let filterList = document.querySelectorAll(`.${filterSelectClass}`);
      filterList.forEach((filterNode) => {
        document.multiselect(`#${filterNode.id}`);
      });
    }

    function addUpdateBtnHandlerForEvidenceMap(
      dataSettings,
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
      chartHeight,
      chartWidth,
      cellHeight,
      labelColumnsHeight,
      totalRowName
    ) {
      document
        .getElementById(updateButtonId)
        .addEventListener("click", async function (event) {
          let studyListHeaderElement =
            document.getElementById(studyListHeaderId);
          let studyListElement = document.getElementById(
            studyListItemWrapperId
          );
          studyListHeaderElement.innerHTML = "";
          studyListElement.innerHTML = "";

          filtersValuesFromFilterBlockArray =
            getValuesFromFilterBlockForEvidenceMap(
              filtersBlockArray,
              filterSelectClass
            );

          let filteredStudiesArray = getFilteredStudiesArrayForEvidenceMap(
            arrayOfStudies,
            filtersValuesFromFilterBlockArray
          );

          let dataForChartForFiltration = getDataForChartForEvidenceMap(
            dataSettings,
            filteredStudiesArray,
            labelsArrayX,
            labelsArrayY,
            cellWidth,
            labelRowWidth,
            chartHeight,
            cellHeight,
            labelColumnsHeight,
            totalRowName
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
          filtersValuesFromFilterBlockArray =
            initializeStudiesValuesArrayForEvidenceMap(filtersBlockArray);
        });
    }

    function getValuesFromFilterBlockForEvidenceMap(
      filtersBlockArray,
      filterSelectClass
    ) {
      let resultArray =
        initializeStudiesValuesArrayForEvidenceMap(filtersBlockArray);
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

    function getFilteredStudiesArrayForEvidenceMap(
      studiesArray,
      filtersValuesFromFilterBlockArray
    ) {
      let resultArray = studiesArray.filter((study) => {
        let isAllFiltersMatchesFlagArray = [];

        study.filtersBlockArray.forEach((studyFilter) => {
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
  }
} else {
  throw "Evidence Gap Map Visualization: Required resources are not loaded.";
}
