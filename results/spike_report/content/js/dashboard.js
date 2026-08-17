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

    var data = {"OkPercent": 32.61689291101056, "KoPercent": 67.38310708898945};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3261689291101056, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0488997555012225, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/180/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/190/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/183/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/182/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/184/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/181/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [0.04833333333333333, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/198/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/189/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/179/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/195/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [0.04833333333333333, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/185/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/186/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/187/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/188/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/193/cancel"], "isController": false}, {"data": [0.050505050505050504, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/197/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/192/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/194/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/196/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/191/cancel"], "isController": false}, {"data": [0.6684782608695652, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [0.047619047619047616, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [0.04966139954853273, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5304, 3574, 67.38310708898945, 2.9521116138763155, 0, 63, 2.0, 4.0, 5.0, 12.0, 89.3546050304082, 28.463788663050252, 21.326158022582927], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 409, 389, 95.11002444987776, 2.276283618581907, 1, 9, 2.0, 3.0, 4.0, 7.0, 10.131787554498613, 3.4872048249851364, 2.0091767071071143], "isController": false}, {"data": ["Step 10: PUT /api/orders/180/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.750651041666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/190/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 5: GET /api/products/3", 118, 0, 0.0, 3.02542372881356, 1, 9, 3.0, 5.0, 6.0, 8.620000000000005, 2.3795599830607594, 0.9759913993022646, 0.4584953946439735], "isController": false}, {"data": ["Step 10: PUT /api/orders/183/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 5: GET /api/products/2", 118, 0, 0.0, 3.279661016949153, 1, 18, 3.0, 5.0, 6.0, 15.910000000000025, 2.389341108816264, 1.0546700988134288, 0.4603800292593042], "isController": false}, {"data": ["Step 5: GET /api/products/1", 118, 0, 0.0, 3.1355932203389845, 2, 20, 3.0, 4.1000000000000085, 6.0, 19.620000000000005, 2.376636455186304, 0.9817550981873112, 0.4579320871097684], "isController": false}, {"data": ["Step 10: PUT /api/orders/182/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.750651041666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/184/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/181/cancel", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 15.190972222222223, 18.50043402777778], "isController": false}, {"data": ["Step 5: GET /api/products/5", 116, 0, 0.0, 3.146551724137932, 1, 11, 3.0, 5.0, 7.0, 10.489999999999995, 2.3689907282604254, 1.0156122360413349, 0.45423737899767186], "isController": false}, {"data": ["Step 5: GET /api/products/4", 117, 0, 0.0, 3.059829059829061, 1, 20, 3.0, 4.200000000000003, 6.0, 17.65999999999991, 2.3594893822977796, 0.9977137720067759, 0.452310301843225], "isController": false}, {"data": ["Step 2: GET /api/users/me", 600, 571, 95.16666666666667, 2.4883333333333333, 1, 10, 2.0, 4.0, 4.0, 6.0, 11.641669415394167, 3.1409201345097886, 2.2168436766332293], "isController": false}, {"data": ["Step 10: PUT /api/orders/198/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 10: PUT /api/orders/189/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/179/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/195/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 4: GET /api/products", 600, 0, 0.0, 3.1300000000000017, 1, 19, 3.0, 5.0, 5.0, 7.0, 11.539571112606982, 4.8975562554091745, 2.366438479661506], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 600, 571, 95.16666666666667, 2.9683333333333346, 1, 26, 2.0, 4.0, 7.0, 18.99000000000001, 11.532695190866106, 3.0076045210567792, 3.45635475531465], "isController": false}, {"data": ["Step 10: PUT /api/orders/185/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/186/cancel", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 15.190972222222223, 18.50043402777778], "isController": false}, {"data": ["Step 10: PUT /api/orders/187/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/188/cancel", 1, 0, 0.0, 10.0, 10, 10, 10.0, 10.0, 10.0, 10.0, 100.0, 27.34375, 33.30078125], "isController": false}, {"data": ["Step 10: PUT /api/orders/193/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 7: POST /api/cart", 495, 470, 94.94949494949495, 2.442424242424244, 1, 8, 2.0, 4.0, 4.0, 6.0400000000000205, 10.783373997908678, 2.811148674407459, 2.9530676452487796], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 389, 389, 100.0, 1.7429305912596404, 0, 6, 2.0, 3.0, 3.0, 4.100000000000023, 9.635868218974487, 2.5124773578771364, 2.0984361453430767], "isController": false}, {"data": ["Step 10: PUT /api/orders/197/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/192/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/194/cancel", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 11.88858695652174, 14.478600543478262], "isController": false}, {"data": ["Step 10: PUT /api/orders/196/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/191/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 552, 183, 33.15217391304348, 3.7735507246376807, 2, 24, 3.0, 5.699999999999989, 6.0, 9.470000000000027, 11.504314117794173, 4.071249211944062, 3.0453314524196573], "isController": false}, {"data": ["Step 1: POST /api/login", 609, 580, 95.23809523809524, 3.627257799671598, 1, 63, 3.0, 4.0, 5.0, 62.0, 10.290464845136109, 3.0444209290143798, 2.644215283410216], "isController": false}, {"data": ["Step 8: POST /api/checkout", 443, 421, 95.03386004514672, 2.9255079006772013, 1, 23, 2.0, 4.0, 7.7999999999999545, 17.0, 10.244195726574786, 2.680533534999075, 2.8964910594533344], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 183, 5.120313374370453, 3.4502262443438916], "isController": false}, {"data": ["403/Forbidden", 2811, 78.65137101287074, 52.997737556561084], "isController": false}, {"data": ["401/Unauthorized", 580, 16.228315612758813, 10.935143288084465], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5304, 3574, "403/Forbidden", 2811, "401/Unauthorized", 580, "400/Bad Request", 183, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 409, 389, "403/Forbidden", 389, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 600, 571, "403/Forbidden", 571, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 600, 571, "403/Forbidden", 571, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 7: POST /api/cart", 495, 470, "403/Forbidden", 470, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 389, 389, "403/Forbidden", 389, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 552, 183, "400/Bad Request", 183, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 1: POST /api/login", 609, 580, "401/Unauthorized", 580, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 8: POST /api/checkout", 443, 421, "403/Forbidden", 421, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
