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

    var data = {"OkPercent": 30.064821483691738, "KoPercent": 69.93517851630826};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3004424323490071, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.047866805411030174, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/219/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5179/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5180/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5181/cancel"], "isController": false}, {"data": [0.04786150712830957, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5178/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5182/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/212/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/1057/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5175/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5177/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/205/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/201/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/203/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/207/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/2445/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/216/cancel"], "isController": false}, {"data": [0.9994871794871795, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/210/cancel"], "isController": false}, {"data": [0.04855371900826446, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/214/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/308/cancel"], "isController": false}, {"data": [0.664778578784758, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5074/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5142/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/3898/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/269/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/4628/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/4942/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5170/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/209/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/208/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5173/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5171/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5172/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5174/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/4303/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5176/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/211/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5040/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/204/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/206/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/202/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/231/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/215/cancel"], "isController": false}, {"data": [0.04805725971370143, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/217/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5009/cancel"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/213/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/4977/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5109/cancel"], "isController": false}, {"data": [0.04781281790437437, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [0.047619047619047616, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9719, 6797, 69.93517851630826, 8.396337071715168, 0, 583, 2.0, 9.0, 44.0, 144.0, 10.803450345701519, 22.639734780379495, 2.580743510107045], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 961, 915, 95.21331945889698, 5.917793964620195, 1, 184, 2.0, 15.0, 33.0, 90.13999999999999, 1.095689868460208, 20.101528393303635, 0.2171429234653216], "isController": false}, {"data": ["Step 10: PUT /api/orders/219/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/5179/cancel", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 14.391447368421053, 17.578125], "isController": false}, {"data": ["Step 10: PUT /api/orders/5180/cancel", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 7.595486111111112, 9.27734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/5181/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.109375], "isController": false}, {"data": ["Step 2: GET /api/users/me", 982, 935, 95.21384928716904, 6.204684317718941, 0, 369, 2.0, 4.0, 28.0, 121.03999999999951, 1.0950191126553879, 0.2953324374740741, 0.2084544542578625], "isController": false}, {"data": ["Step 10: PUT /api/orders/5178/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.796875], "isController": false}, {"data": ["Step 10: PUT /api/orders/5182/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.265625], "isController": false}, {"data": ["Step 10: PUT /api/orders/212/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/1057/cancel", 1, 0, 0.0, 167.0, 167, 167, 167.0, 167.0, 167.0, 167.0, 5.9880239520958085, 1.6373502994011975, 1.9999064371257484], "isController": false}, {"data": ["Step 10: PUT /api/orders/5175/cancel", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 9.114583333333334, 11.1328125], "isController": false}, {"data": ["Step 10: PUT /api/orders/5177/cancel", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 14.391447368421053, 17.578125], "isController": false}, {"data": ["Step 10: PUT /api/orders/205/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/201/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/203/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/207/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/2445/cancel", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 1.617973372781065, 1.9762389053254437], "isController": false}, {"data": ["Step 10: PUT /api/orders/216/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 4: GET /api/products", 975, 0, 0.0, 10.113846153846147, 1, 541, 2.0, 10.399999999999977, 72.19999999999993, 155.00000000000023, 1.0938893657124587, 0.46426202962757274, 0.22430867594509235], "isController": false}, {"data": ["Step 10: PUT /api/orders/210/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 7: POST /api/cart", 968, 921, 95.14462809917356, 4.760330578512399, 1, 176, 2.0, 3.0, 29.549999999999955, 76.0, 1.0966788079282628, 0.2858984315255505, 0.30011098314479445], "isController": false}, {"data": ["Step 10: PUT /api/orders/214/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/308/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 971, 324, 33.36766220391349, 16.22142121524203, 1, 572, 2.0, 20.600000000000136, 117.99999999999989, 255.87999999999943, 1.0957587028744764, 0.3877127599323586, 0.28999303266455567], "isController": false}, {"data": ["Step 10: PUT /api/orders/5074/cancel", 1, 0, 0.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 7.595486111111112, 9.27734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/5142/cancel", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 5.258413461538462, 6.4227764423076925], "isController": false}, {"data": ["Step 10: PUT /api/orders/3898/cancel", 1, 0, 0.0, 251.0, 251, 251, 251.0, 251.0, 251.0, 251.0, 3.9840637450199203, 1.0893924302788844, 1.3306150398406373], "isController": false}, {"data": ["Step 10: PUT /api/orders/269/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/4628/cancel", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.510416666666666, 7.952008928571428], "isController": false}, {"data": ["Step 10: PUT /api/orders/4942/cancel", 1, 0, 0.0, 35.0, 35, 35, 35.0, 35.0, 35.0, 35.0, 28.57142857142857, 7.812499999999999, 9.542410714285714], "isController": false}, {"data": ["Step 5: GET /api/products/3", 195, 0, 0.0, 9.241025641025645, 1, 191, 2.0, 7.400000000000034, 83.19999999999993, 189.07999999999998, 0.21956714870100696, 0.09005683833439738, 0.0421815674645399], "isController": false}, {"data": ["Step 5: GET /api/products/2", 195, 0, 0.0, 11.22051282051282, 1, 372, 2.0, 5.0, 80.19999999999987, 236.63999999999888, 0.21995623434926792, 0.09709005656823155, 0.04239290704593138], "isController": false}, {"data": ["Step 5: GET /api/products/1", 195, 0, 0.0, 10.348717948717953, 1, 230, 2.0, 29.200000000000017, 79.19999999999987, 143.59999999999928, 0.22034620343491482, 0.0910219180204775, 0.04246806710332881], "isController": false}, {"data": ["Step 10: PUT /api/orders/5170/cancel", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 12.428977272727273, 15.181107954545455], "isController": false}, {"data": ["Step 10: PUT /api/orders/209/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 5: GET /api/products/5", 194, 0, 0.0, 10.706185567010314, 1, 395, 2.0, 12.0, 54.5, 364.60000000000036, 0.21987836419564186, 0.09426425965028006, 0.04224769028545652], "isController": false}, {"data": ["Step 10: PUT /api/orders/208/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 5: GET /api/products/4", 195, 0, 0.0, 8.907692307692308, 1, 227, 2.0, 4.0, 59.59999999999991, 178.9999999999996, 0.22014470845502443, 0.09308853394631406, 0.04229252384336535], "isController": false}, {"data": ["Step 10: PUT /api/orders/5173/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.8740234375], "isController": false}, {"data": ["Step 10: PUT /api/orders/5171/cancel", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.214488636363637, 7.5905539772727275], "isController": false}, {"data": ["Step 10: PUT /api/orders/5172/cancel", 1, 0, 0.0, 23.0, 23, 23, 23.0, 23.0, 23.0, 23.0, 43.47826086956522, 11.88858695652174, 14.521059782608695], "isController": false}, {"data": ["Step 10: PUT /api/orders/5174/cancel", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 12.428977272727273, 15.181107954545455], "isController": false}, {"data": ["Step 10: PUT /api/orders/4303/cancel", 1, 0, 0.0, 87.0, 87, 87, 87.0, 87.0, 87.0, 87.0, 11.494252873563218, 3.1429597701149428, 3.8389008620689657], "isController": false}, {"data": ["Step 10: PUT /api/orders/5176/cancel", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 15.190972222222223, 18.5546875], "isController": false}, {"data": ["Step 10: PUT /api/orders/211/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/5040/cancel", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.510416666666666, 7.952008928571428], "isController": false}, {"data": ["Step 10: PUT /api/orders/204/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/206/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/202/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/231/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/215/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 978, 931, 95.19427402862986, 6.005112474437624, 0, 278, 2.0, 14.0, 32.0, 89.21000000000004, 1.0954374693378315, 0.2856781719103175, 0.3282630585134981], "isController": false}, {"data": ["Step 10: PUT /api/orders/217/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/5009/cancel", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 8.820564516129032, 10.773689516129032], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 915, 915, 100.0, 5.157377049180335, 0, 295, 1.0, 2.0, 37.19999999999993, 75.5200000000001, 1.0446767724397141, 0.27239130687637075, 0.2275028518106018], "isController": false}, {"data": ["Step 10: PUT /api/orders/213/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/4977/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.8740234375], "isController": false}, {"data": ["Step 10: PUT /api/orders/5109/cancel", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 12.428977272727273, 15.181107954545455], "isController": false}, {"data": ["Step 1: POST /api/login", 983, 936, 95.21871820956257, 11.477110885045796, 1, 583, 2.0, 10.0, 78.59999999999991, 196.11999999999978, 1.0954647980243744, 0.32415720497951717, 0.28366408144496597], "isController": false}, {"data": ["Step 8: POST /api/checkout", 966, 920, 95.23809523809524, 6.700828157349891, 0, 229, 2.0, 14.0, 29.649999999999977, 124.99000000000012, 1.0961975788331737, 0.2868212117777692, 0.3096952313986846], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 324, 4.766808886273356, 3.333676304146517], "isController": false}, {"data": ["403/Forbidden", 5537, 81.46240988671472, 56.9708817779607], "isController": false}, {"data": ["401/Unauthorized", 936, 13.770781227011916, 9.630620434201049], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9719, 6797, "403/Forbidden", 5537, "401/Unauthorized", 936, "400/Bad Request", 324, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 961, 915, "403/Forbidden", 915, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 982, 935, "403/Forbidden", 935, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 7: POST /api/cart", 968, 921, "403/Forbidden", 921, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 971, 324, "400/Bad Request", 324, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 978, 931, "403/Forbidden", 931, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 915, 915, "403/Forbidden", 915, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 1: POST /api/login", 983, 936, "401/Unauthorized", 936, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 8: POST /api/checkout", 966, 920, "403/Forbidden", 920, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
