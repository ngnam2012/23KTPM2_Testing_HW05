/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 28.335766423357665, "KoPercent": 71.66423357664233};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.28335766423357667, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.046037735849056606, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/68/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/64/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/65/cancel"], "isController": false}, {"data": [0.04606661941885188, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/63/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/66/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/67/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/69/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/19/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/44/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/35/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/70/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/60/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/62/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/28/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/24/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/26/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/51/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/53/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/55/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/39/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/40/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/31/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/33/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/48/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/46/cancel"], "isController": false}, {"data": [0.0458919319022946, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/37/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/42/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/20/cancel"], "isController": false}, {"data": [0.4996342355523043, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/22/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/17/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/76/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/58/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/57/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/59/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/56/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/73/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/72/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/74/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/71/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/75/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/61/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/36/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/18/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/43/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/45/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/29/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/25/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/27/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/50/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/52/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/54/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/32/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/41/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/47/cancel"], "isController": false}, {"data": [0.045779685264663805, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/49/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/30/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/34/cancel"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/38/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/21/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/23/cancel"], "isController": false}, {"data": [0.0456140350877193, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/16/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/product_id"], "isController": false}, {"data": [0.045590433482810166, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13700, 9818, 71.66423357664233, 1.8062773722627716, 0, 35, 2.0, 3.0, 3.0, 6.0, 45.73282682280366, 15.598460955807736, 10.916603232885242], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 1325, 1264, 95.39622641509433, 1.6022641509433964, 0, 6, 1.0, 3.0, 3.0, 4.0, 4.727061266281605, 2.158202393364633, 0.9357581503901163], "isController": false}, {"data": ["Step 10: PUT /api/orders/68/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/64/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/65/cancel", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 68.359375, 83.0078125], "isController": false}, {"data": ["Step 2: GET /api/users/me", 1411, 1346, 95.39333805811481, 1.5825655563430177, 0, 5, 1.0, 3.0, 3.0, 4.0, 4.752041761387556, 1.2788208038646123, 0.9035945261850635], "isController": false}, {"data": ["Step 10: PUT /api/orders/63/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/66/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/67/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/69/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/19/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/44/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/35/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 36.892361111111114], "isController": false}, {"data": ["Step 10: PUT /api/orders/70/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/60/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.338541666666664], "isController": false}, {"data": ["Step 10: PUT /api/orders/62/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.50390625], "isController": false}, {"data": ["Step 10: PUT /api/orders/28/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/24/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/26/cancel", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 68.359375, 83.0078125], "isController": false}, {"data": ["Step 10: PUT /api/orders/51/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 36.892361111111114], "isController": false}, {"data": ["Step 10: PUT /api/orders/53/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/55/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/39/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 10: PUT /api/orders/40/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 4: GET /api/products", 1384, 0, 0.0, 2.0057803468208104, 1, 14, 2.0, 3.0, 3.75, 5.0, 4.735412261433078, 1.8588488579324998, 0.9748884845055531], "isController": false}, {"data": ["Step 10: PUT /api/orders/31/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/33/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/48/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/46/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.338541666666664], "isController": false}, {"data": ["Step 7: POST /api/cart", 1351, 1289, 95.41080680977053, 1.6609918578830467, 0, 7, 2.0, 3.0, 3.0, 4.0, 4.7585837665722694, 2.3032225943351365, 1.3051481190649787], "isController": false}, {"data": ["Step 10: PUT /api/orders/37/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/42/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/20/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 1367, 684, 50.036576444769565, 2.307242136064376, 0, 15, 2.0, 4.0, 4.0, 5.319999999999936, 4.758258205993943, 1.6402300103989, 1.2637525725312402], "isController": false}, {"data": ["Step 10: PUT /api/orders/22/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 10: PUT /api/orders/17/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 5: GET /api/products/3", 229, 0, 0.0, 1.956331877729258, 1, 6, 2.0, 3.0, 4.0, 4.0, 0.7986914016859713, 0.32758827022276166, 0.15784386782006077], "isController": false}, {"data": ["Step 5: GET /api/products/2", 229, 0, 0.0, 1.97816593886463, 1, 5, 2.0, 3.0, 4.0, 4.0, 0.7937113109060787, 0.3503491333296363, 0.14804576209283304], "isController": false}, {"data": ["Step 5: GET /api/products/1", 230, 0, 0.0, 1.973913043478261, 0, 6, 2.0, 3.0, 4.0, 4.689999999999998, 0.7976389885937625, 0.3294934493898062, 0.15759737047903424], "isController": false}, {"data": ["Step 10: PUT /api/orders/76/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/58/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 5: GET /api/products/5", 229, 0, 0.0, 2.0480349344978155, 1, 6, 2.0, 3.0, 3.5, 5.0, 0.7991401391690339, 0.34260011825703696, 0.15793255095827025], "isController": false}, {"data": ["Step 10: PUT /api/orders/57/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/59/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.669270833333332], "isController": false}, {"data": ["Step 5: GET /api/products/4", 229, 0, 0.0, 2.069868995633187, 1, 6, 2.0, 3.0, 4.0, 5.0, 0.7975620374401393, 0.33725035372224643, 0.1487640128428385], "isController": false}, {"data": ["Step 10: PUT /api/orders/56/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 10: PUT /api/orders/73/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.338541666666664], "isController": false}, {"data": ["Step 10: PUT /api/orders/72/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/74/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/71/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/75/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/61/cancel", 1, 0, 0.0, 10.0, 10, 10, 10.0, 10.0, 10.0, 10.0, 100.0, 27.34375, 33.203125], "isController": false}, {"data": ["Step 10: PUT /api/orders/36/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/18/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 10: PUT /api/orders/43/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.50390625], "isController": false}, {"data": ["Step 10: PUT /api/orders/45/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 10: PUT /api/orders/29/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/25/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/27/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.540865384615387], "isController": false}, {"data": ["Step 10: PUT /api/orders/50/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 10: PUT /api/orders/52/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 10: PUT /api/orders/54/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/32/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.338541666666664], "isController": false}, {"data": ["Step 10: PUT /api/orders/41/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.669270833333332], "isController": false}, {"data": ["Step 10: PUT /api/orders/47/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.184659090909093], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 1398, 1334, 95.42203147353362, 1.7367668097281832, 0, 5, 2.0, 3.0, 3.0, 4.0, 4.7511911963621785, 1.2390483959631866, 1.4127932959944534], "isController": false}, {"data": ["Step 10: PUT /api/orders/49/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/30/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/34/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 1264, 1264, 100.0, 1.1249999999999996, 0, 3, 1.0, 2.0, 2.0, 2.0, 4.509454156261149, 1.1758049411344986, 0.9820393328576524], "isController": false}, {"data": ["Step 10: PUT /api/orders/38/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 10: PUT /api/orders/21/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 10: PUT /api/orders/23/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 1: POST /api/login", 1425, 1360, 95.43859649122807, 1.4877192982456109, 0, 35, 1.0, 2.0, 3.0, 4.0, 4.756913380780067, 1.4027548161661614, 1.2264210704974563], "isController": false}, {"data": ["Step 10: PUT /api/orders/16/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 5: GET /api/products/product_id", 230, 0, 0.0, 1.9869565217391294, 1, 5, 2.0, 3.0, 3.4499999999999886, 5.0, 0.7957045791068735, 0.1857162054751394, 0.1554110506068112], "isController": false}, {"data": ["Step 8: POST /api/checkout", 1338, 1277, 95.44095665171898, 2.0852017937219762, 0, 17, 2.0, 3.0, 4.0, 15.0, 4.730037861513824, 1.237111044532352, 1.3299123248330524], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 568, 5.7852923202281525, 4.145985401459854], "isController": false}, {"data": ["403/Forbidden", 7548, 76.87920146669383, 55.09489051094891], "isController": false}, {"data": ["401/Unauthorized", 1360, 13.852108372377266, 9.927007299270073], "isController": false}, {"data": ["404/Not Found", 342, 3.4833978407007535, 2.4963503649635035], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13700, 9818, "403/Forbidden", 7548, "401/Unauthorized", 1360, "400/Bad Request", 568, "404/Not Found", 342, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 1325, 1264, "403/Forbidden", 1264, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 1411, 1346, "403/Forbidden", 1346, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 7: POST /api/cart", 1351, 1289, "403/Forbidden", 1063, "400/Bad Request", 226, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 1367, 684, "400/Bad Request", 342, "404/Not Found", 342, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 1398, 1334, "403/Forbidden", 1334, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 1264, 1264, "403/Forbidden", 1264, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 1: POST /api/login", 1425, 1360, "401/Unauthorized", 1360, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 8: POST /api/checkout", 1338, 1277, "403/Forbidden", 1277, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
